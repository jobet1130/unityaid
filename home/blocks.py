# home/blocks/hero_block.py
from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock


class HeroBlock(blocks.StructBlock):
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
