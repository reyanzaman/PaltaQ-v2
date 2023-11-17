"""
Serializers for classroom APIs
"""
from rest_framework import serializers

from core.models import Classroom


class ClassroomSerializer(serializers.ModelSerializer):
    """Serailizer for Classroom"""
    semester = serializers.CharField(max_length=255)

    class Meta:
        model = Classroom
        fields = [
            'class_id',
            'institution',
            'course_id',
            'course_name',
            'section',
            'semester',
            'year'
        ]
        read_only_fields = ['class_id']

    def to_representation(self, instance):
        """Convert `semester` to proper format on read."""
        ret = super().to_representation(instance)
        ret['semester'] = instance.semester
        return ret

    def create(self, validated_data):
        # Create a Classroom instance using the validated data
        return Classroom.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Update the Classroom instance with validated data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ClassroomDetailSerializer(ClassroomSerializer):
    """Serializer for Classroom Detail"""

    class Meta(ClassroomSerializer.Meta):
        fields = ClassroomSerializer.Meta.fields + [
            'description'
        ]
