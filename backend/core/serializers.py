from rest_framework import serializers

from .models import Block, Page


class BlockSerializer(serializers.ModelSerializer):
    """Serializer for Block CRUD operations."""

    class Meta:
        model = Block
        fields = ["id", "page", "type", "data", "position", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "page": {"required": False},  # Set automatically from URL in views
        }


class PageSerializer(serializers.ModelSerializer):
    """Serializer for Page CRUD with child count for UI hints."""

    children_count = serializers.SerializerMethodField()
    blocks_count = serializers.SerializerMethodField()

    class Meta:
        model = Page
        fields = [
            "id", "parent", "title", "icon", "cover", "position",
            "children_count", "blocks_count",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "children_count", "blocks_count", "created_at", "updated_at"]

    def get_children_count(self, obj):
        return obj.children.count()

    def get_blocks_count(self, obj):
        return obj.blocks.count()


class PageTreeSerializer(serializers.ModelSerializer):
    """
    Recursive serializer for the sidebar page tree.
    Returns pages with nested children (lightweight, no blocks).
    """

    children = serializers.SerializerMethodField()

    class Meta:
        model = Page
        fields = ["id", "parent", "title", "icon", "position", "children"]

    def get_children(self, obj):
        children = obj.children.order_by("position", "created_at")
        return PageTreeSerializer(children, many=True).data


class PageDetailSerializer(serializers.ModelSerializer):
    """
    Full page detail including inline blocks and child page summaries.
    Used for the main page view.
    """

    blocks = BlockSerializer(many=True, read_only=True)
    children = serializers.SerializerMethodField()

    class Meta:
        model = Page
        fields = [
            "id", "parent", "title", "icon", "cover", "position",
            "blocks", "children",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "blocks", "children", "created_at", "updated_at"]

    def get_children(self, obj):
        children = obj.children.order_by("position", "created_at")
        return PageSerializer(children, many=True).data
