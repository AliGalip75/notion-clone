from django.contrib import admin

from .models import Block, Page


class BlockInline(admin.TabularInline):
    model = Block
    extra = 0
    fields = ("type", "position", "data")
    ordering = ("position",)


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ("title", "icon", "user", "parent", "position", "created_at")
    list_filter = ("user", "created_at")
    search_fields = ("title",)
    ordering = ("user", "position")
    inlines = [BlockInline]
    raw_id_fields = ("parent",)


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ("type", "page", "position", "created_at")
    list_filter = ("type", "page__user")
    search_fields = ("page__title",)
    ordering = ("page", "position")
    raw_id_fields = ("page",)
