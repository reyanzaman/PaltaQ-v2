"""
Database Models.
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import FileExtensionValidator


class UserManager(BaseUserManager):
    """Manager for users."""

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a new user."""
        if not email:
            raise ValueError('Users must have an email address.')

        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a new superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user in the system."""
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    disp_name = models.CharField(max_length=255)
    institution = models.CharField(max_length=255)
    classID = models.CharField(max_length=255, default='')
    picture = models.ImageField(
        upload_to='profile_pics',  # Directory name where images will be stored
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'gif'])],  # Validates the file extension
        blank=True,  # Allows the field to be blank
        null=True  # Allows the database to store a NULL value
    )  # Optional field

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_faculty = models.BooleanField(default=False)

    qScore = models.IntegerField(default=0)
    qCoins = models.IntegerField(default=0)
    rank = models.CharField(max_length=255, default='Novice Questioner')

    questions_asked = models.IntegerField(default=0)
    knowledge_q = models.IntegerField(default=0)
    comprehensive_q = models.IntegerField(default=0)
    application_q = models.IntegerField(default=0)
    analytical_q = models.IntegerField(default=0)
    evaluative_q = models.IntegerField(default=0)
    synthetic_q = models.IntegerField(default=0)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'disp_name', 'institution']

    objects = UserManager()

    def __str__(self):
        return self.email
