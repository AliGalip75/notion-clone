from django.urls import path

from .views import (
    BlockDetailView,
    BlockListCreateView,
    BlockReorderView,
    PageChildrenView,
    PageDetailView,
    PageListCreateView,
    PageTreeView,
)

urlpatterns = [
    # Pages
    path("pages/", PageListCreateView.as_view(), name="page-list-create"),
    path("pages/tree/", PageTreeView.as_view(), name="page-tree"),
    path("pages/<int:pk>/", PageDetailView.as_view(), name="page-detail"),
    path("pages/<int:pk>/children/", PageChildrenView.as_view(), name="page-children"),

    # Blocks
    path("pages/<int:pk>/blocks/", BlockListCreateView.as_view(), name="block-list-create"),
    path("pages/<int:pk>/blocks/reorder/", BlockReorderView.as_view(), name="block-reorder"),
    path("blocks/<int:pk>/", BlockDetailView.as_view(), name="block-detail"),
]
