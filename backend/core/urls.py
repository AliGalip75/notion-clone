from django.urls import path

from .views import (
    BlockDetailView,
    BlockListCreateView,
    ContentReorderView,
    PageChildrenView,
    PageDetailView,
    PageListCreateView,
    PageTreeView,
    FileUploadView,
)

urlpatterns = [
    # Pages
    path("pages/", PageListCreateView.as_view(), name="page-list-create"),
    path("pages/tree/", PageTreeView.as_view(), name="page-tree"),
    path("pages/<int:pk>/", PageDetailView.as_view(), name="page-detail"),
    path("pages/<int:pk>/children/", PageChildrenView.as_view(), name="page-children"),
    path("pages/<int:pk>/reorder-content/", ContentReorderView.as_view(), name="content-reorder"),

    # Blocks
    path("pages/<int:pk>/blocks/", BlockListCreateView.as_view(), name="block-list-create"),
    path("blocks/<int:pk>/", BlockDetailView.as_view(), name="block-detail"),

    # Uploads
    path("upload/", FileUploadView.as_view(), name="file-upload"),
]
