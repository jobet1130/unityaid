"""
====================================================
Wagtail Home Page Model
====================================================

This module defines the HomePage model used as the main
landing page in the UnityAid project. It leverages
Wagtail’s StreamField for flexible content management,
allowing editors to compose dynamic sections using
custom blocks.

Blocks Supported:
-----------------
1. HeroBlock            – A large banner with title, subtitle, and CTA buttons.
2. StatsBlock           – Individual statistic with icon and label.
3. ImpactStatisticBlock – Grouped impact metrics to highlight achievements.
4. SectionHeaderBlock   – Section header with title, optional subtitle, and centering option.
5. ProjectCardBlock     – Project card with image, title, location, description, and status.
6. ProjectCardsBlock    – Section with multiple project cards in a grid layout.

Author:
--------
Jobet Casquejo

Date:
-----
November 2025

Version:
--------
1.0
"""

from django.db import models
from wagtail.models import Page
from wagtail.fields import StreamField
from wagtail.admin.panels import FieldPanel

# Import custom StreamField blocks
from .blocks import (
    HeroBlock,
    StatsBlock,
    ImpactStatisticBlock,
    SectionHeaderBlock,
    ProjectCardBlock,
    ProjectCardsBlock,
    TeamMemberBlock,
    TeamSectionBlock
)


# ======================================================
# HOMEPAGE MODEL
# ======================================================
class HomePage(Page):
    """
    Represents the main landing page of the UnityAid website.

    This page uses Wagtail's StreamField to allow administrators and
    content editors to flexibly compose sections like hero banners,
    section headers, impact statistics, project cards, and metric visualizations.

    Attributes:
    -----------
    content : StreamField
        Contains a series of dynamic content blocks such as Hero,
        Section Header, Stats, Impact Statistics, Project Cards, and Project Cards Section.
        Editors can add or reorder these blocks within the CMS.
    subtitle : CharField
        Optional subtitle displayed under the page title.
    """

    content = StreamField(
        [
            ('hero_section', HeroBlock()),
            ('section_header', SectionHeaderBlock()),
            ('stats', StatsBlock()),
            ('impact_statistic', ImpactStatisticBlock()),
            ('project_card', ProjectCardBlock()),
            ('project_cards', ProjectCardsBlock()),
            ('team_member', TeamMemberBlock()),
            ('team_section', TeamSectionBlock()),
        ],
        use_json_field=True,
        null=True,
        blank=True,
        help_text="Composable content blocks for the home page."
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
        ordering = ["title"]

    def __str__(self):
        """
        Returns a human-readable string representation of the HomePage instance.
        """
        return self.title
