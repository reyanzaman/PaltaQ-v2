# Generated by Django 4.2.7 on 2023-11-14 00:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_alter_user_std_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='classroom',
            name='description',
            field=models.TextField(blank=True),
        ),
    ]
