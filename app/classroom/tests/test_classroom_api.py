"""
Test for classroom APIs.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APIClient

from core.models import Classroom

from classroom.serializers import ClassroomSerializer

CLASSROOM_URL = reverse('classroom:classroom-list')


def create_classroom(user, **params):
    """Create and return a sample classroom."""
    defaults = {
        'user': user,
        'institution': 'IUB',
        'course_id': 'CSE-101',
        'section': 11,
        'semester': 'Summer',
        'year': 2023,
    }
    defaults.update(params)

    classroom = Classroom.objects.create(
        **defaults
    )

    return classroom


class PublicClassroomAPITests(TestCase):
    """Test unauthenticated API requests."""

    def setUp(self):
        self.client = APIClient()

    def test_auth_required(self):
        """Test auth is required to call API."""
        res = self.client.get(CLASSROOM_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateClassroomAPITests(TestCase):
    """Test authenticated API requests."""

    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='test@example.com',
            password='test-user-password123',
            std_id=2021065,
            disp_name='Test User',
            institution='DU',
        )
        self.client.force_authenticate(self.user)

    def test_retrive_classroom(self):
        """Test retrieving a list of classrooms."""
        create_classroom(user=self.user)
        create_classroom(user=self.user)
        create_classroom(user=self.user)

        res = self.client.get(CLASSROOM_URL)

        classroom = Classroom.objects.all().order_by('-class_id')
        serializer = ClassroomSerializer(classroom, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_classroom_list_limited_to_user(self):
        """Test list of classrooms is limited to authenticated user"""
        other_user = get_user_model().objects.create_user(
            email='other@example.com',
            password='test-user-123',
            std_id=2021066,
            disp_name='Test User 2',
            institution='IUB',
        )
        create_classroom(user=other_user)
        create_classroom(user=self.user)

        res = self.client.get(CLASSROOM_URL)

        classroom = Classroom.objects.filter(user=self.user)
        serializer = ClassroomSerializer(classroom, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)
