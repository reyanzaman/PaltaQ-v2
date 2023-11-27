"""
Database Models.
"""

from django.db import models
from django.conf import settings
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin
)
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db.models import F
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

    date_joined = models.DateTimeField(
        default=timezone.now, verbose_name='Date Joined'
    )

    qScore = models.IntegerField(default=0)
    qCoins = models.IntegerField(default=0)
    rank = models.CharField(max_length=255, default='Novice Questioner')

    # Statistics of questions asked
    questions_asked = models.IntegerField(
        default=0,
        verbose_name='Number of Qyeustions Asked Asked'
        )
    knowledge_q = models.IntegerField(
        default=0,
        verbose_name='Knowledge-Based Questions Asked'
        )
    comprehensive_q = models.IntegerField(
        default=0,
        verbose_name='Comprehensive Questions Asked'
        )
    application_q = models.IntegerField(
        default=0,
        verbose_name='Application-Based Questions Asked'
        )
    analytical_q = models.IntegerField(
        default=0,
        verbose_name='Analytical Questions Asked'
        )
    evaluative_q = models.IntegerField(
        default=0,
        verbose_name='Evaluative Questions Asked'
        )
    synthetic_q = models.IntegerField(
        default=0,
        verbose_name='Synthetic Questions Asked'
        )

    # Statistics of Questions Answered

    questions_answered = models.IntegerField(
        default=0,
        verbose_name='Number of Questions Answered'
        )
    knowledge_ans = models.IntegerField(
        default=0,
        verbose_name='Knowledge-Based Questions Answered'
        )
    comprehensive_ans = models.IntegerField(
        default=0,
        verbose_name='Comprehensive Questions Answered'
        )
    application_ans = models.IntegerField(
        default=0,
        verbose_name='Application-Based Questions Answered'
        )
    analytical_ans = models.IntegerField(
        default=0,
        verbose_name='Analytical Questions Answered'
        )
    evaluative_ans = models.IntegerField(
        default=0,
        verbose_name='Evaluative Questions Answered'
        )
    synthetic_ans = models.IntegerField(
        default=0,
        verbose_name='Synthetic Questions Answered'
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


# Model for storing classroom specific data for each user
class UserClassroomStats(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='classroom_stats'
    )
    classroom = models.ForeignKey(
        Classroom, on_delete=models.CASCADE, related_name='user_stats'
    )
    score = models.IntegerField(
        default=0, verbose_name='Classroom Score'
    )
    coins = models.IntegerField(
        default=0, verbose_name='Classroom Coins'
    )
    rank = models.CharField(
        max_length=255, default='Novice Questioner',
        verbose_name='Classroom Rank'
    )

    class Meta:
        # Ensures that each user-classroom combination is unique
        unique_together = ('user', 'classroom')

    def __str__(self):
        return (
            f'{self.user.disp_name} - '
            f'{self.classroom.course_name} - {self.rank}'
        )


class Question(models.Model):
    """Question model for students"""
    original_question = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='counter_questions',
        verbose_name='Original Question'
    )

    LEVEL_CHOICES = [
        ('Basic', 'Basic'),  # Blue
        ('Fundamental', 'Fundamental'),  # Green
        ('Practical', 'Practical'),  # Yellow
        ('Analytical', 'Analytical'),  # Orange
        ('Inventive', 'Inventive'),  # Purple
        ('Critical', 'Critical')  # Red
    ]

    timestamp = models.DateTimeField(auto_now_add=True)

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


class UserQuestionVote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    vote_type = models.CharField(
        max_length=10, choices=[('upvote', 'Upvote'), ('downvote', 'Downvote')]
    )

    class Meta:
        # Ensures a user can only vote once per question
        unique_together = ('user', 'question')

    def __str__(self):
        return (
            f'{self.user.disp_name} {self.vote_type} '
            f'on Question {self.question.id}'
        )


class Answer(models.Model):
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name='answers'
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='answers'
    )
    content = models.TextField(
        verbose_name='Answer Content'
    )
    timestamp = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f'Answer by {self.user.disp_name} '
            f'for Question {self.question.id}'
        )


class UserAnswerVote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE)
    vote_type = models.CharField(
        max_length=10, choices=[('upvote', 'Upvote'), ('downvote', 'Downvote')]
    )

    class Meta:
        # Ensures a user can only vote once per answer
        unique_together = ('user', 'answer')

    def __str__(self):
        return (
            f'{self.user.disp_name} {self.vote_type} '
            f'on Answer {self.answer.id}'
        )


class Report(models.Model):
    REPORT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('resolved', 'Resolved'),
        ('declined', 'Declined'),
    ]

    reporting_user = models.ForeignKey(User, on_delete=models.CASCADE)
    reported_question = models.ForeignKey(
        Question, on_delete=models.CASCADE, null=True, blank=True
    )
    reported_answer = models.ForeignKey(
        Answer, on_delete=models.CASCADE, null=True, blank=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10, choices=REPORT_STATUS_CHOICES, default='pending'
    )
    coins_deducted = models.IntegerField(default=10)
    coins_awarded = models.IntegerField(default=10)

    def __str__(self):
        report_type = 'Question' if self.reported_question else 'Answer'
        return (
            f'Report on {report_type} by {self.reporting_user.disp_name} - '
            f'Status: {self.get_status_display()}'
        )

    class Meta:
        # Unique constraint for reporting_user and reported_question
        # Unique constraint for reporting_user and reported_answer
        constraints = [
            models.UniqueConstraint(
                fields=['reporting_user', 'reported_question'],
                condition=models.Q(reported_question__isnull=False),
                name='unique_report_per_user_per_question'
            ),
            models.UniqueConstraint(
                fields=['reporting_user', 'reported_answer'],
                condition=models.Q(reported_answer__isnull=False),
                name='unique_report_per_user_per_answer'
            ),
        ]

    def clean(self):
        # Custom validation to ensure either
        # reported_question or reported_answer is set, but not both
        if self.reported_question and self.reported_answer:
            raise ValidationError(
                "A report can be for either a question or an answer, not both."
            )
        if not self.reported_question and not self.reported_answer:
            raise ValidationError(
                "A report must be for either a question or an answer."
            )

    def save(self, *args, **kwargs):
        # Check if the report instance already exists in the database
        if self.pk is not None:
            original = Report.objects.get(pk=self.pk)

            if original.status != self.status:
                reported_entity = self.reported_question \
                  or self.reported_answer
                classroom = reported_entity.classroom

                if self.status == 'resolved':
                    # Logic for when the report is approved
                    award_amount = self.coins_awarded
                    deduction_amount = self.coins_deducted

                    # Update total coins for reporting user
                    self.reporting_user.qCoins = F('qCoins') + award_amount
                    self.reporting_user.save(update_fields=['qCoins'])

                    # Update classroom-specific coins for reporting user
                    reporting_user_stats = UserClassroomStats.objects.get(
                        user=self.reporting_user, classroom=classroom
                    )
                    reporting_user_stats.coins = F('coins') + award_amount
                    reporting_user_stats.save(update_fields=['coins'])

                    # Update total and class-specific coins for reported user
                    reported_user_stats = UserClassroomStats.objects.get(
                        user=reported_entity.user, classroom=classroom
                    )
                    reported_entity.user.qCoins = F('qCoins')-deduction_amount
                    reported_entity.user.save(update_fields=['qCoins'])
                    reported_user_stats.coins = F('coins') - deduction_amount
                    reported_user_stats.save(update_fields=['coins'])

                elif self.status == 'declined':
                    # Logic for when the report is declined
                    deduction_amount = self.coins_deducted

                    # Update total and class-specific coins for reporting user
                    self.reporting_user.qCoins = F('qCoins') - deduction_amount
                    self.reporting_user.save(update_fields=['qCoins'])
                    reporting_user_stats = UserClassroomStats.objects.get(
                        user=self.reporting_user, classroom=classroom
                    )
                    reporting_user_stats.coins = F('coins') - deduction_amount
                    reporting_user_stats.save(update_fields=['coins'])

        super().save(*args, **kwargs)


class RewardShopItem(models.Model):
    item_name = models.CharField(max_length=255)
    description = models.TextField()
    coin_cost = models.IntegerField()

    def __str__(self):
        return self.item_name


class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item = models.ForeignKey(RewardShopItem, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    coins_spent = models.IntegerField()

    def __str__(self):
        return (
            f'Transaction by {self.user.disp_name} '
            f'for {self.item.item_name}'
        )
