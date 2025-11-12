"""
==============================================
Wagtail StreamField Blocks for UnityAid Project
==============================================

This module defines reusable and flexible content blocks
for building dynamic and visually engaging pages using
Wagtail CMS StreamFields.

Blocks Included:
----------------
1. HeroBlock              – Defines a full-width banner section with image and CTA buttons.
2. StatsBlock             – Represents individual statistics with icons and numeric labels.
3. ImpactStatisticBlock   – Displays grouped statistical metrics to showcase organization impact.
4. SectionHeaderBlock     – Displays a section header with title, optional subtitle, and centering option.
5. ProjectCardBlock       – Displays a project card with image, title, location, description, and status.
6. ProjectCardsBlock      – Displays a section with multiple project cards in a grid layout.

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

from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock


# ======================================================
# 1. HERO SECTION BLOCK
# ======================================================
class HeroBlock(blocks.StructBlock):
    """
    Represents a hero banner section that appears at the top of a page.

    Attributes:
    -----------
    title : CharBlock
        The main heading displayed prominently.
    subtitle : TextBlock
        Optional supporting text below the title.
    background_image : ImageChooserBlock
        Background image for the hero section.
    primary_button_text : CharBlock
        Text for the main (primary) button.
    secondary_button_text : CharBlock
        Text for the secondary button.
    primary_button_link : PageChooserBlock
        Page linked to the primary button.
    secondary_button_link : PageChooserBlock
        Page linked to the secondary button.
    height : ChoiceBlock
        Determines the height of the hero section (full, medium, small).
    """

    title = blocks.CharBlock(required=True, help_text="Main heading text")
    subtitle = blocks.TextBlock(required=False, help_text="Optional subtitle text")
    background_image = ImageChooserBlock(required=True, help_text="Background image for hero section")

    primary_button_text = blocks.CharBlock(required=False, help_text="Text for primary button")
    secondary_button_text = blocks.CharBlock(required=False, help_text="Text for secondary button")

    primary_button_link = blocks.PageChooserBlock(required=False, help_text="Link for primary button")
    secondary_button_link = blocks.PageChooserBlock(required=False, help_text="Link for secondary button")

    height = blocks.ChoiceBlock(
        choices=[
            ('full', 'Full Screen'),
            ('medium', 'Medium Height'),
            ('small', 'Small Height'),
        ],
        default='full',
        help_text="Hero section height",
    )

    class Meta:
        template = "blocks/hero.html"
        icon = "image"
        label = "Hero Section"


# ======================================================
# 2. STATISTICS ITEM BLOCK
# ======================================================
class StatsBlock(blocks.StructBlock):
    """
    Represents an individual statistical item displayed
    in an impact or metrics section.

    Attributes:
    -----------
    icon_name : ChoiceBlock
        Icon identifier for visual representation.
    number : CharBlock
        Numerical value or metric (e.g., '500', '10k').
    label : CharBlock
        Descriptive text for the statistic.
    suffix : CharBlock
        Optional text displayed after the number (e.g., '+', '%').
    """

    icon_name = blocks.ChoiceBlock(
        choices=[
            ('users', 'Users'),
            ('utensils', 'Utensils'),
            ('heart', 'Heart'),
            ('globe', 'Globe')
        ],
        required=True,
        help_text="Icon representing the statistic"
    )
    number = blocks.CharBlock(required=True, max_length=20, help_text="Main numeric value")
    label = blocks.CharBlock(required=True, max_length=50, help_text="Description of the statistic")
    suffix = blocks.CharBlock(required=False, max_length=5, help_text="Optional suffix like '+'")

    class Meta:
        template = "blocks/stats.html"
        icon = "pick"
        label = "Statistics Block"


# ======================================================
# 3. IMPACT STATISTICS SECTION BLOCK
# ======================================================
class ImpactStatisticBlock(blocks.StructBlock):
    """
    Represents a section that groups multiple statistics together,
    often used to showcase organizational achievements or metrics.

    Attributes:
    -----------
    section_title : CharBlock
        Main heading of the section.
    section_subtitle : TextBlock
        Optional subtitle or context for the section.
    stats : ListBlock
        A list of `StatsBlock` items to display.
    """

    section_title = blocks.CharBlock(required=True, max_length=100, help_text="Title for the statistics section")
    section_subtitle = blocks.TextBlock(required=False, help_text="Subtitle for the statistics section")
    stats = blocks.ListBlock(StatsBlock(), help_text="List of impact statistics")

    class Meta:
        template = "blocks/impact_statistics.html"
        icon = "group"
        label = "Impact Statistics Section"


# ======================================================
# 4. SECTION HEADER BLOCK
# ======================================================
class SectionHeaderBlock(blocks.StructBlock):
    """
    Represents a section header with a title, optional subtitle,
    and optional text centering.

    Attributes:
    -----------
    title : CharBlock
        The main heading text (required).
    subtitle : TextBlock
        Optional subtitle text displayed below the title.
    centered : BooleanBlock
        Whether to center-align the text (default: True).
    """

    title = blocks.CharBlock(required=True, help_text="Main heading text")
    subtitle = blocks.TextBlock(required=False, help_text="Optional subtitle text")
    centered = blocks.BooleanBlock(
        required=False,
        default=True,
        help_text="Center-align the header text"
    )

    class Meta:
        template = "blocks/section_header.html"
        icon = "title"
        label = "Section Header"


# ======================================================
# 5. PROJECT CARD BLOCK
# ======================================================
class ProjectCardBlock(blocks.StructBlock):
    """
    Represents a project card displaying project information
    with an image, title, location, description, and status.

    Attributes:
    -----------
    image : ImageChooserBlock
        Project image displayed at the top of the card.
    title : CharBlock
        Project title (required).
    location : CharBlock
        Project location (required).
    description : TextBlock
        Project description (required).
    status : ChoiceBlock
        Project status (Active, Ongoing, or Completed).
    link : URLBlock
        Optional link to the project page or details.
    """

    image = ImageChooserBlock(required=True, help_text="Project image")
    title = blocks.CharBlock(required=True, max_length=200, help_text="Project title")
    location = blocks.CharBlock(required=True, max_length=100, help_text="Project location")
    description = blocks.TextBlock(required=True, help_text="Project description")
    status = blocks.ChoiceBlock(
        choices=[
            ('Active', 'Active'),
            ('Ongoing', 'Ongoing'),
            ('Completed', 'Completed'),
        ],
        required=True,
        default='Active',
        help_text="Project status"
    )
    link = blocks.URLBlock(required=False, help_text="Optional link to project details page")

    class Meta:
        template = "blocks/project_card.html"
        icon = "doc-full"
        label = "Project Card"


# ======================================================
# 6. PROJECT CARDS SECTION BLOCK
# ======================================================
class ProjectCardsBlock(blocks.StructBlock):
    """
    Represents a section that groups multiple project cards together,
    often used to showcase multiple projects in a grid layout.

    Attributes:
    -----------
    section_title : CharBlock
        Optional title for the projects section.
    section_subtitle : TextBlock
        Optional subtitle for the projects section.
    projects : ListBlock
        A list of `ProjectCardBlock` items to display.
    """

    section_title = blocks.CharBlock(required=False, max_length=200, help_text="Optional title for the projects section")
    section_subtitle = blocks.TextBlock(required=False, help_text="Optional subtitle for the projects section")
    projects = blocks.ListBlock(ProjectCardBlock(), help_text="List of project cards")

    class Meta:
        template = "blocks/project_cards.html"
        icon = "folder"
        label = "Project Cards Section"