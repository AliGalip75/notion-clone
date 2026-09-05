from django.conf import settings
from django.db import models


class Page(models.Model):
    """
    A workspace page that can contain blocks and child pages.
    Supports recursive nesting via self-referencing parent field.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="pages",
    )
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="children",
    )

    title = models.CharField(max_length=200, default="Yeni Sayfa")
    icon = models.CharField(max_length=50, blank=True, default="📄")
    cover = models.ImageField(upload_to="covers/", null=True, blank=True)
    position = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["position", "created_at"]
        verbose_name = "Sayfa"
        verbose_name_plural = "Sayfalar"

    def __str__(self) -> str:
        return f"{self.icon} {self.title}"


class Block(models.Model):
    """
    A content block inside a Page.
    The `type` field determines which frontend component renders it.
    The `data` field stores type-specific JSON content.

    Supported block types and their data schemas:

    text:
        {"content": "..."}

    heading:
        {"content": "...", "level": 1|2|3}

    checklist:
        {"items": [{"text": "...", "completed": true|false}, ...]}

    progress:
        {"title": "...", "value": 72, "max": 100}

    number:
        {"title": "...", "value": 47, "unit": "saat"}

    chart:
        {"chartType": "line"|"bar"|"pie", "title": "...",
         "xAxis": "...", "yAxis": "...",
         "data": [{"label": "...", "value": 0}, ...]}

    table:
        {"columns": ["Col A", "Col B"],
         "rows": [{"header": "Row Label (optional)", "cells": ["val1", "val2"]}, ...]}
    """

    class BlockType(models.TextChoices):
        TEXT = "text", "Text"
        HEADING = "heading", "Heading"
        CHECKLIST = "checklist", "Checklist"
        PROGRESS = "progress", "Progress"
        NUMBER = "number", "Number"
        CHART = "chart", "Chart"
        TABLE = "table", "Table"
        IMAGE = "image", "Image"
        BULLETED_LIST = "bulleted_list", "Bulleted List"
        NUMBERED_LIST = "numbered_list", "Numbered List"
        DIVIDER = "divider", "Divider"

    page = models.ForeignKey(
        Page,
        on_delete=models.CASCADE,
        related_name="blocks",
    )
    type = models.CharField(max_length=20, choices=BlockType.choices)
    data = models.JSONField(default=dict)
    position = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["position", "created_at"]
        verbose_name = "Blok"
        verbose_name_plural = "Bloklar"

    def __str__(self) -> str:
        return f"{self.get_type_display()} — {self.page.title}"
