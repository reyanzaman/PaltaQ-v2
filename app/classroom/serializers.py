"""
Serializers for classroom APIs
"""
from rest_framework import serializers

from core.models import Classroom


class ClassroomSerializer(serializers.ModelSerializer):
    """Serailizer for Classroom"""

    class Meta:
        model = Classroom
        fields = [
            'class_id',
            'institution',
            'course_id',
            'section',
            'semester',
            'year'
        ]
        read_only_fields = ['class_id']
