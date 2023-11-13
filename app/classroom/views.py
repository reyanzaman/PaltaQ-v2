"""
Views for the classroom APIs.
"""

from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from core.models import Classroom
from classroom import serializers

class ClassroomViewSet(viewsets.ModelViewSet):
    """View for Managing classroom APIs"""
    serializer_class = serializers.ClassroomSerializer
    queryset = Classroom.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return objects for the current authenticated user only"""
        return self.queryset.filter(user=self.request.user).order_by('-class_id')

    def perform_create(self, serializer):
        """Create a new classroom"""
        serializer.save(user=self.request.user)
