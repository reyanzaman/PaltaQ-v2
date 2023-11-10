# Generated by Django 4.2.7 on 2023-11-10 01:02

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('email', models.EmailField(max_length=255, unique=True)),
                ('name', models.CharField(max_length=255)),
                ('disp_name', models.CharField(max_length=255)),
                ('institution', models.CharField(max_length=255)),
                ('classID', models.CharField(default='', max_length=255)),
                ('picture', models.ImageField(blank=True, null=True, upload_to='profile_pics', validators=[django.core.validators.FileExtensionValidator(['jpg', 'jpeg', 'png', 'gif'])])),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_faculty', models.BooleanField(default=False)),
                ('qScore', models.IntegerField(default=0)),
                ('qCoins', models.IntegerField(default=0)),
                ('rank', models.CharField(default='Novice Questioner', max_length=255)),
                ('questions_asked', models.IntegerField(default=0)),
                ('knowledge_q', models.IntegerField(default=0)),
                ('comprehensive_q', models.IntegerField(default=0)),
                ('application_q', models.IntegerField(default=0)),
                ('analytical_q', models.IntegerField(default=0)),
                ('evaluative_q', models.IntegerField(default=0)),
                ('synthetic_q', models.IntegerField(default=0)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
