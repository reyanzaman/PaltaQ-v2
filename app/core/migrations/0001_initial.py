# Generated by Django 4.2.7 on 2023-11-10 23:56

import django.core.validators
from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Classroom',
            fields=[
                ('institution', models.CharField(choices=[('IUB', 'Independent University, Bangladesh (IUB)'), ('DU', 'University of Dhaka (DU)')], max_length=255, verbose_name='Institution')),
                ('class_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True, verbose_name='Class ID')),
                ('course_id', models.CharField(max_length=255, verbose_name='Course ID')),
                ('section', models.IntegerField(verbose_name='Section')),
                ('semester', models.CharField(max_length=255, verbose_name='Semester')),
                ('year', models.IntegerField(verbose_name='Year')),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('email', models.EmailField(max_length=255, unique=True)),
                ('name', models.CharField(max_length=255, verbose_name='Full Name')),
                ('disp_name', models.CharField(max_length=255, verbose_name='Display Name')),
                ('institution', models.CharField(choices=[('IUB', 'Independent University, Bangladesh (IUB)'), ('DU', 'University of Dhaka (DU)')], max_length=255, verbose_name='Institution')),
                ('picture', models.ImageField(blank=True, null=True, upload_to='profile_pics', validators=[django.core.validators.FileExtensionValidator(['jpg', 'jpeg', 'png', 'gif'])], verbose_name='Profile Picture')),
                ('is_active', models.BooleanField(default=True, verbose_name='Active Member')),
                ('is_staff', models.BooleanField(default=False, verbose_name='Admin User')),
                ('is_faculty', models.BooleanField(default=False, verbose_name='Faculty')),
                ('qScore', models.IntegerField(default=0)),
                ('qCoins', models.IntegerField(default=0)),
                ('rank', models.CharField(default='Novice Questioner', max_length=255)),
                ('questions_asked', models.IntegerField(default=0, verbose_name='Number of Qyeustions Asked')),
                ('knowledge_q', models.IntegerField(default=0, verbose_name='Knowledge-Based Questions')),
                ('comprehensive_q', models.IntegerField(default=0, verbose_name='Comprehensive Questions')),
                ('application_q', models.IntegerField(default=0, verbose_name='Application-Based Questions')),
                ('analytical_q', models.IntegerField(default=0, verbose_name='Analytical Questions')),
                ('evaluative_q', models.IntegerField(default=0, verbose_name='Evaluative Questions')),
                ('synthetic_q', models.IntegerField(default=0, verbose_name='Synthetic Questions')),
                ('classes', models.ManyToManyField(related_name='members', to='core.classroom', verbose_name='Enrolled Classes')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
