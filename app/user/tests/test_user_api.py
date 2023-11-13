"""
Tests for the user API.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework.test import APIClient
from rest_framework import status

CREATE_USER_URL = reverse('user:create')
TOKEN_URL = reverse('user:token')
ME_URL = reverse('user:me')


def create_user(**params):
    """
    Create and return a new user.
    """
    return get_user_model().objects.create_user(**params)


class PublicUserApiTests(TestCase):
    """Test the public features of the user API."""

    def setUp(self):
        self.client = APIClient()

    def test_create_user_success(self):
        """Test creating a user is successful."""
        payload = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'std_id': 2021065,
            'disp_name': 'Test User',
            'institution': 'IUB',
        }
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = get_user_model().objects.get(email=payload['email'])
        self.assertTrue(user.check_password(payload['password']))
        self.assertNotIn('password', res.data)

    def test_user_with_email_exists_error(self):
        """Test error returned if user already exists."""
        payload = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'std_id': 2021065,
            'disp_name': 'Test User',
            'institution': 'IUB',
        }
        create_user(**payload)
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_too_short_error(self):
        """Test an error is returned if password less than 5 chars."""
        payload = {
            'email': 'test@example.com',
            'password': 'pw',
            'std_id': 2021065,
            'disp_name': 'Test User',
            'institution': 'IUB',
        }
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = get_user_model().objects.filter(
            email=payload['email']
        ).exists()
        self.assertFalse(user_exists)

    def test_create_token_for_user(self):
        """Test that a token is created for the user."""
        user_details = {
            'std_id': 2021065,
            'email': 'test@example.com',
            'password': 'test-user-password123',
            'disp_name': 'Test User',
            'institution': 'IUB',
        }
        create_user(**user_details)

        payload = {
            'email': user_details['email'],
            'password': user_details['password']
        }
        res = self.client.post(TOKEN_URL, payload)

        self.assertIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_create_token_bad_credentials(self):
        """Test reuturns error if credentials invalid."""
        user_details = {
            'std_id': 2021065,
            'email': 'test@example.com',
            'password': 'test-user-password123',
            'disp_name': 'Test User',
            'institution': 'IUB',
        }
        create_user(**user_details)

        payload = {'email': 'test@example.com', 'password': 'badpass'}
        res = self.client.post(TOKEN_URL, payload)

        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_token_blank_password(self):
        """Test posting a blank password returns an error."""
        payload = {'email': 'test@example.com', 'password': ''}
        res = self.client.post(TOKEN_URL, payload)

        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_display_name_required(self):
        """Test that display name is required."""
        payload = {
            'std_id': 2021065,
            'email': 'test@example.com',
            'password': 'test-user-password123',
            'disp_name': '',
            'institution': 'IUB',
        }
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = get_user_model().objects.filter(
            email=payload['email']
        ).exists()
        self.assertFalse(user_exists)

    def test_display_name_too_short(self):
        """Test an error is returned if display name less than 3 chars."""
        payload = {
            'email': 'test@example.com',
            'password': 'test-user-password123',
            'std_id': 2021065,
            'disp_name': 'dn',
            'institution': 'IUB',
        }
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = get_user_model().objects.filter(
            email=payload['email']
        ).exists()
        self.assertFalse(user_exists)

    def test_institution_required(self):
        """Test that institution is required."""
        payload = {
            'email': 'test@example.com',
            'password': 'test-user-password123',
            'std_id': 2021065,
            'disp_name': 'Test User',
            'institution': '',
        }
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = get_user_model().objects.filter(
            email=payload['email']
        ).exists()
        self.assertFalse(user_exists)

    def test_institution_valid(self):
        """Test if institution is valid."""
        payload = {
            'email': 'test@example.com',
            'password': 'test-user-password123',
            'std_id': 2021065,
            'disp_name': 'Test User',
            'institution': 'IBA',
        }
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = get_user_model().objects.filter(
            email=payload['email']
        ).exists()
        self.assertFalse(user_exists)

    def test_institution_choices(self):
        """Test if institution is from valid choices."""
        payload = {
            'email': 'test@example.com',
            'password': 'test-user-password123',
            'std_id': 2021065,
            'disp_name': 'Test User',
            'institution': 'DU',
        }
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user_exists = get_user_model().objects.filter(
            email=payload['email']
        ).exists()
        self.assertTrue(user_exists)

    def test_user_creation_fails_with_string_std_id(self):
        """Test that user creation fails when a string is passed as std_id."""
        payload = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'std_id': 'stringvalue',
            'disp_name': 'Test User',
            'institution': 'Test Institution',
        }
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('std_id', res.data)  # Check if error related to std_id

        user_exists = get_user_model().objects.filter(
            email=payload['email']
        ).exists()
        self.assertFalse(user_exists)

    def test_student_id_length_too_short(self):
        """Test if student id validation works on too short id."""
        payload = {
            'email': 'test@example.com',
            'password': 'test-user-password123',
            'std_id': '223',
            'disp_name': 'Test User',
            'institution': 'DU',
        }
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = get_user_model().objects.filter(
            email=payload['email']
        ).exists()
        self.assertFalse(user_exists)

    def test_student_id_length_too_long(self):
        """Test if student id validation works on too long id."""
        payload = {
            'email': 'test@example.com',
            'password': 'test-user-password123',
            'std_id': '20210650',
            'disp_name': 'Test User',
            'institution': 'IUB',
        }
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = get_user_model().objects.filter(
            email=payload['email']
        ).exists()
        self.assertFalse(user_exists)

    def test_student_id_duplicate_error(self):
        """Test if error is returned on duplicate id"""
        payload1 = {
            'email': 'test@example.com',
            'password': 'test-user-password123',
            'std_id': '2021065',
            'disp_name': 'Test User',
            'institution': 'IUB',
        }
        payload2 = {
            'email': 'test2@example.com',
            'password': 'test2-user-password123',
            'std_id': '2021065',
            'disp_name': 'Test User 2',
            'institution': 'IUB',
        }
        res = self.client.post(CREATE_USER_URL, payload1)
        res2 = self.client.post(CREATE_USER_URL, payload2)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user_exists = get_user_model().objects.filter(
            email=payload1['email']
        ).exists()
        self.assertTrue(user_exists)

        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = get_user_model().objects.filter(
            email=payload2['email']
        ).exists()
        self.assertFalse(user_exists)

    def test_student_id_duplicate_success(self):
        """Test if success is returned on different institutions same id"""
        payload1 = {
            'email': 'test@example.com',
            'password': 'test-user-password123',
            'std_id': '2021065',
            'disp_name': 'Test User',
            'institution': 'IUB',
        }
        payload2 = {
            'email': 'test2@example.com',
            'password': 'test2-user-password123',
            'std_id': '2021065',
            'disp_name': 'Test User 2',
            'institution': 'DU',
        }
        res = self.client.post(CREATE_USER_URL, payload1)
        res2 = self.client.post(CREATE_USER_URL, payload2)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user_exists = get_user_model().objects.filter(
            email=payload1['email']
        ).exists()
        self.assertTrue(user_exists)

        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        user_exists = get_user_model().objects.filter(
            email=payload2['email']
        ).exists()
        self.assertTrue(user_exists)

    def test_retrieve_user_unauthorized(self):
        """Test authentication is required for users."""
        res = self.client.get(ME_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateUserApiTests(TestCase):
    """Test API requests that require authentication."""

    def setUp(self):
        self.user = create_user(
            email='test@example.com',
            password='test-user-password123',
            std_id=2021065,
            disp_name='Test User',
            institution='DU',
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_retrieve_profile_success(self):
        """Test retrieving profile for logged in users."""
        res = self.client.get(ME_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, {
            'std_id': self.user.std_id,
            'email': self.user.email,
            'disp_name': self.user.disp_name,
            'institution': self.user.institution,
        })

    def test_post_me_not_allowed(self):
        """Test POST is not allowed for the me endpoint."""
        self.client.force_authenticate(user=self.user)
        res = self.client.post(ME_URL, {})

        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_update_user_profile(self):
        """Test updating the user profile for the authenticated user."""
        payload = {'std_id': 2021066, 'password': 'newpassword123'}

        res = self.client.patch(ME_URL, payload)

        self.user.refresh_from_db()
        self.assertEqual(self.user.std_id, payload['std_id'])
        self.assertTrue(self.user.check_password(payload['password']))
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_update_user_all(self):
        """Test updating the user profile for the authenticated user."""
        payload = {
            'std_id': 2021065,
            'password': 'newpassword123',
            'disp_name': 'Updated Display Name',
            'institution': 'IUB'
        }

        res = self.client.patch(ME_URL, payload)

        self.user.refresh_from_db()
        self.assertEqual(self.user.std_id, payload['std_id'])
        self.assertTrue(self.user.check_password(payload['password']))
        self.assertEqual(self.user.disp_name, payload['disp_name'])
        self.assertEqual(self.user.institution, payload['institution'])
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_update_user_invalid_institution(self):
        """Test updating the user profile for the authenticated user."""
        payload = {
            'std_id': '2021065',
            'password': 'newpassword123',
            'disp_name': 'Updated Display Name',
            'institution': 'JU'
        }

        res = self.client.patch(ME_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
