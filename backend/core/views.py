from django.db import models
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Block, Page
from .serializers import (
    BlockSerializer,
    PageDetailSerializer,
    PageSerializer,
    PageTreeSerializer,
)


# ──────────────────────────────────────────────
# Page Views
# ──────────────────────────────────────────────


class PageListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/pages/       — list root pages (parent=null) for the current user.
    POST /api/pages/       — create a new page for the current user.
    """

    serializer_class = PageSerializer

    def get_queryset(self):
        return Page.objects.filter(user=self.request.user, parent__isnull=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/pages/:id/ — retrieve a page with its blocks and children.
    PATCH  /api/pages/:id/ — update page fields (title, icon, cover, position).
    DELETE /api/pages/:id/ — delete a page and all its children/blocks (cascade).
    """

    def get_serializer_class(self):
        if self.request.method == "GET":
            return PageDetailSerializer
        return PageSerializer

    def get_queryset(self):
        return Page.objects.filter(user=self.request.user)


class PageChildrenView(generics.ListAPIView):
    """
    GET /api/pages/:id/children/ — list child pages of a given page.
    """

    serializer_class = PageSerializer

    def get_queryset(self):
        return Page.objects.filter(
            user=self.request.user,
            parent_id=self.kwargs["pk"],
        )


class PageTreeView(APIView):
    """
    GET /api/pages/tree/ — return the full recursive page tree for the sidebar.
    """

    def get(self, request):
        root_pages = Page.objects.filter(
            user=request.user,
            parent__isnull=True,
        ).order_by("position", "created_at")
        serializer = PageTreeSerializer(root_pages, many=True)
        return Response(serializer.data)


# ──────────────────────────────────────────────
# Block Views
# ──────────────────────────────────────────────


class BlockListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/pages/:pk/blocks/ — list blocks for a page.
    POST /api/pages/:pk/blocks/ — create a new block on a page.
    """

    serializer_class = BlockSerializer

    def get_queryset(self):
        return Block.objects.filter(
            page_id=self.kwargs["pk"],
            page__user=self.request.user,
        )

    def perform_create(self, serializer):
        page = Page.objects.get(pk=self.kwargs["pk"], user=self.request.user)

        # Auto-assign position to end if not provided
        if "position" not in serializer.validated_data:
            max_pos = page.blocks.aggregate(
                max_pos=models.Max("position")
            )["max_pos"]
            position = (max_pos or 0) + 1
        else:
            position = serializer.validated_data["position"]

        serializer.save(page=page, position=position)


class BlockDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/blocks/:id/ — retrieve a block.
    PATCH  /api/blocks/:id/ — update a block (type, data, position).
    DELETE /api/blocks/:id/ — delete a block.
    """

    serializer_class = BlockSerializer

    def get_queryset(self):
        return Block.objects.filter(page__user=self.request.user)


class BlockReorderView(APIView):
    """
    PATCH /api/pages/:pk/blocks/reorder/

    Accepts a list of block IDs in the desired order:
    {"order": [5, 3, 8, 1, 2]}

    Updates position values accordingly.
    """

    def patch(self, request, pk):
        # Verify page ownership
        try:
            page = Page.objects.get(pk=pk, user=request.user)
        except Page.DoesNotExist:
            return Response(
                {"detail": "Sayfa bulunamadı."},
                status=status.HTTP_404_NOT_FOUND,
            )

        order = request.data.get("order", [])
        if not isinstance(order, list):
            return Response(
                {"detail": "'order' bir liste olmalıdır."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Bulk update positions
        blocks = Block.objects.filter(page=page)
        block_ids = set(blocks.values_list("id", flat=True))

        for position, block_id in enumerate(order):
            if block_id not in block_ids:
                return Response(
                    {"detail": f"Block {block_id} bu sayfaya ait değil."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            Block.objects.filter(id=block_id, page=page).update(position=position)

        return Response({"detail": "Sıralama güncellendi."})
