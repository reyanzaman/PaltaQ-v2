"""
Tests for models.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError

from core import models


class ModelTests(TestCase):
    """
    Test cases for models.
    """

    def test_create_user_with_email_successful(self):
        """
        Test creating a new user with an email is successful.
        """
        email = 'test@example.com'
        password = 'test-user-password123'
        std_id = 2021065
        disp_name = 'Test User'
        institution = 'IUB'

        user = get_user_model().objects.create_user(
            email=email,
            password=password,
            std_id=std_id,
            disp_name=disp_name,
            institution=institution,
        )

        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))
        self.assertEqual(user.std_id, std_id)
        self.assertEqual(user.disp_name, disp_name)
        self.assertEqual(user.institution, institution)

    def test_create_user_without_std_id_error(self):
        """
        Test error is raised when creating a new user without a std_id.
        """
        email = 'test@example.com'
        password = 'test-user-password123'
        disp_name = 'Test User'
        institution = 'IUB'

        with self.assertRaises(IntegrityError):
            get_user_model().objects.create_user(
                email=email,
                password=password,
                disp_name=disp_name,
                institution=institution,
            )

    def test_create_classroom(self):
        """Test creating a classroom is successful."""

        user = get_user_model().objects.create_user(
            email='test@example.com',
            password='test-user-password123',
            std_id=2021065,
            disp_name='Test User',
            institution='DU',
        )

        classroom = models.Classroom.objects.create(
            user=user,
            institution='IUB',
            course_id='CSE-101',
            section=11,
            semester='Summer',
            year=2023,
        )

        self.assertEqual(str(classroom), 'CSE-101-11-Summer-2023-IUB')
