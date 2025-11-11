from django.db import models
from wagtail.models import Page
from wagtail.fields import StreamField
from wagtail.admin.panels import FieldPanel
from .blocks import HeroBlock


class HomePage(Page):
    content = StreamField(
        [
            ('hero_section', HeroBlock())
        ],
        use_json_field=True,
        null=True,
        blank=True
    )
    
    subtitle = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Optional subtitle displayed under the page title."
    )

    content_panels = Page.content_panels + [
        FieldPanel("subtitle"),
        FieldPanel("content"),
    ]

    class Meta:
        verbose_name = "Home Page"
        verbose_name_plural = "Home Pages"
