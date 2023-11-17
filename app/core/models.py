"""
Database Models.
"""

from django.db import models
from django.conf import settings
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin
)
from django.core.validators import FileExtensionValidator
import uuid


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

    INSTITUTION_CHOICES = [
        ('IUB', 'Independent University, Bangladesh (IUB)'),
        ('DU', 'University of Dhaka (DU)'),
    ]

    email = models.EmailField(
        max_length=255,
        unique=True
        )
    std_id = models.IntegerField(
        verbose_name='Student ID / Faculty ID',
        )
    disp_name = models.CharField(
        max_length=255,
        verbose_name='Display Name'
        )
    institution = models.CharField(
        max_length=255,
        choices=INSTITUTION_CHOICES,
        verbose_name='Institution'
        )
    classes = models.ManyToManyField(
        'Classroom',
        related_name='members',
        verbose_name='Enrolled Classes',
        blank=True,
        )

    picture = models.ImageField(
        upload_to='profile_pics',  # Directory name where images will be stored
        validators=[
            FileExtensionValidator
            (['jpg', 'jpeg', 'png', 'gif'])
            ],  # Validates the file extension
        blank=True,  # Allows the field to be blank
        null=True,  # Allows the database to store a NULL value
        verbose_name='Profile Picture'
    )  # Optional field

    is_active = models.BooleanField(default=True, verbose_name='Active Member')
    is_staff = models.BooleanField(default=False, verbose_name='Admin User')
    is_faculty = models.BooleanField(default=False, verbose_name='Faculty')

    qScore = models.IntegerField(default=0)
    qCoins = models.IntegerField(default=0)
    rank = models.CharField(max_length=255, default='Novice Questioner')

    questions_asked = models.IntegerField(
        default=0,
        verbose_name='Number of Qyeustions Asked'
        )
    knowledge_q = models.IntegerField(
        default=0,
        verbose_name='Knowledge-Based Questions'
        )
    comprehensive_q = models.IntegerField(
        default=0,
        verbose_name='Comprehensive Questions'
        )
    application_q = models.IntegerField(
        default=0,
        verbose_name='Application-Based Questions'
        )
    analytical_q = models.IntegerField(
        default=0,
        verbose_name='Analytical Questions'
        )
    evaluative_q = models.IntegerField(
        default=0,
        verbose_name='Evaluative Questions'
        )
    synthetic_q = models.IntegerField(
        default=0,
        verbose_name='Synthetic Questions'
        )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['std_id', 'disp_name', 'institution']

    objects = UserManager()

    def __str__(self):
        return self.disp_name + ' - ' + str(self.std_id)

    class Meta:
        unique_together = ('std_id', 'institution')


def camel_case(s):
    words = s.strip().split()
    return ''.join(word.capitalize() for word in words)


class Classroom(models.Model):
    """Model for classes."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
    )
    institution = models.CharField(
        max_length=255,
        choices=User.INSTITUTION_CHOICES,
        verbose_name='Institution'
        )
    class_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        verbose_name='Class ID',
        primary_key=True
        )
    course_id = models.CharField(max_length=255, verbose_name='Course ID')
    course_name = models.CharField(max_length=255, verbose_name='Course Name')
    section = models.IntegerField(verbose_name='Section')
    _semester = models.CharField(
        max_length=255,
        verbose_name='Semester'
    )  # Using private field to store the original value
    year = models.IntegerField(verbose_name='Year')
    description = models.TextField(blank=True)

    @property
    def semester(self):
        return self._semester

    @semester.setter
    def semester(self, value):
        # Ensure no whitespace and store in camel case
        cleaned_value = camel_case(value.strip())
        self._semester = cleaned_value

    def __str__(self):
        return (f"{self.course_id}-{self.section}-"
                f"{self.semester}-{self.year}-"
                f"{self.institution}")

    def save(self, *args, **kwargs):
        if not self.class_id:
            self.class_id = str(uuid.uuid4())
        super().save(*args, **kwargs)


class Question(models.Model):
    """Question model for students"""
    LEVEL_CHOICES = [
        ('Basic', 'Basic'),  # Blue
        ('Fundamental', 'Fundamental'),  # Green
        ('Practical', 'Practical'),  # Yellow
        ('Analytical', 'Analytical'),  # Orange
        ('Inventive', 'Inventive'),  # Purple
        ('Critical', 'Critical')  # Red
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
    )
    content = models.CharField(
        max_length=255,
        verbose_name='Question'
    )
    topic = models.CharField(
        max_length=255,
        verbose_name='Question Topic'
    )
    classroom = models.ForeignKey(
        'Classroom',
        on_delete=models.CASCADE
    )
    score = models.IntegerField(
        default=0,
        verbose_name='Question Score'
    )
    level = models.CharField(
        max_length=255,
        choices=LEVEL_CHOICES,
        verbose_name='Question Level'
    )

    is_knowledge = models.BooleanField(default=False)
    is_comprehensive = models.BooleanField(default=False)
    is_application = models.BooleanField(default=False)
    is_analytical = models.BooleanField(default=False)
    is_evaluative = models.BooleanField(default=False)
    is_synthetic = models.BooleanField(default=False)

    is_answered = models.BooleanField(default=False)
    is_anonymous = models.BooleanField(default=False)

    def __str__(self):
        return self.content
