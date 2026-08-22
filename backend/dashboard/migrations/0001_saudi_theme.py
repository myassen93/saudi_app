from django.db import migrations

SAUDI_GREEN = "#006C35"
SAUDI_GREEN_DARK = "#004d26"
WHITE = "#FFFFFF"


def set_saudi_theme(apps, schema_editor):
    Theme = apps.get_model("admin_interface", "Theme")
    Theme.objects.update_or_create(
        name="Django",
        defaults=dict(
            active=True,
            title="لوحة تحكم السعودية",
            title_visible=True,
            title_color=WHITE,
            css_header_background_color=SAUDI_GREEN,
            css_header_text_color=WHITE,
            css_header_link_color=WHITE,
            css_header_link_hover_color="#cfead9",
            css_module_background_color=SAUDI_GREEN_DARK,
            css_module_background_selected_color=SAUDI_GREEN,
            css_module_text_color=WHITE,
            css_module_link_color=WHITE,
            css_module_link_selected_color=WHITE,
            css_module_link_hover_color="#cfead9",
            css_generic_link_color=SAUDI_GREEN,
            css_generic_link_hover_color=SAUDI_GREEN_DARK,
            css_generic_link_active_color=SAUDI_GREEN_DARK,
            css_save_button_background_color=SAUDI_GREEN,
            css_save_button_background_hover_color=SAUDI_GREEN_DARK,
            css_save_button_text_color=WHITE,
        ),
    )


def unset_saudi_theme(apps, schema_editor):
    Theme = apps.get_model("admin_interface", "Theme")
    Theme.objects.filter(name="Django").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("admin_interface", "0032_alter_theme_defaults"),
    ]

    operations = [
        migrations.RunPython(set_saudi_theme, unset_saudi_theme),
    ]
