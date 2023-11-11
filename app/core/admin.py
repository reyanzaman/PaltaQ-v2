"""
Django admin customization.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext as _

from core import models


class UserAdmin(BaseUserAdmin):
    """Define the admin pages for users."""
    ordering = ['id']
    list_display = ['email', 'name']
    fieldsets = (
        (None, {'fields':
            ('email', 'password', 'name', 'disp_name', 'institution', 'classes', 'picture')
                }
         ),  # first section
        (
            _('Permissions'),
            {
                'fields': (
                    'is_active',
                    'is_staff',
                    'is_superuser',
                    'is_faculty',
                )
            }
        ),
        (
            _('Statistics'),
            {
                'fields': (
                    'qScore',
                    'qCoins',
                    'rank',
                    'questions_asked',
                    'knowledge_q',
                    'comprehensive_q',
                    'application_q',
                    'analytical_q',
                    'evaluative_q',
                    'synthetic_q',
                )
            }
        ),
        (
            _('Important dates'), {'fields': ('last_login',)},
        )
    )
    readonly_fields = (
        'last_login',
        'questions_asked',
        'knowledge_q',
        'comprehensive_q',
        'application_q',
        'analytical_q',
        'evaluative_q',
        'synthetic_q',
        'rank'
        )  # fields that can't be edited

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'password1',
                'password2',
                'name',
                'disp_name',
                'institution',
                'classes',
                'picture',
                'is_faculty',
                'is_staff',
                'is_superuser',
            )
        }),
    )

admin.site.register(models.User, UserAdmin)


class ClassroomAdmin(admin.ModelAdmin):
    list_display = ['institution', 'class_id', 'course_id', 'section', 'semester', 'year']
    search_fields = ['institution', 'class_id', 'course_id']

admin.site.register(models.Classroom, ClassroomAdmin)
