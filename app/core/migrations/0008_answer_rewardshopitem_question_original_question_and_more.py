# Generated by Django 4.2.7 on 2023-11-27 03:36

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_delete_questiontype_question_timestamp'),
    ]

    operations = [
        migrations.CreateModel(
            name='Answer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField(verbose_name='Answer Content')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='RewardShopItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item_name', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('coin_cost', models.IntegerField()),
            ],
        ),
        migrations.AddField(
            model_name='question',
            name='original_question',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='counter_questions', to='core.question', verbose_name='Original Question'),
        ),
        migrations.AddField(
            model_name='user',
            name='analytical_ans',
            field=models.IntegerField(default=0, verbose_name='Analytical Questions Answered'),
        ),
        migrations.AddField(
            model_name='user',
            name='application_ans',
            field=models.IntegerField(default=0, verbose_name='Application-Based Questions Answered'),
        ),
        migrations.AddField(
            model_name='user',
            name='comprehensive_ans',
            field=models.IntegerField(default=0, verbose_name='Comprehensive Questions Answered'),
        ),
        migrations.AddField(
            model_name='user',
            name='date_joined',
            field=models.DateTimeField(default=django.utils.timezone.now, verbose_name='Date Joined'),
        ),
        migrations.AddField(
            model_name='user',
            name='evaluative_ans',
            field=models.IntegerField(default=0, verbose_name='Evaluative Questions Answered'),
        ),
        migrations.AddField(
            model_name='user',
            name='knowledge_ans',
            field=models.IntegerField(default=0, verbose_name='Knowledge-Based Questions Answered'),
        ),
        migrations.AddField(
            model_name='user',
            name='questions_answered',
            field=models.IntegerField(default=0, verbose_name='Number of Questions Answered'),
        ),
        migrations.AddField(
            model_name='user',
            name='synthetic_ans',
            field=models.IntegerField(default=0, verbose_name='Synthetic Questions Answered'),
        ),
        migrations.AlterField(
            model_name='user',
            name='analytical_q',
            field=models.IntegerField(default=0, verbose_name='Analytical Questions Asked'),
        ),
        migrations.AlterField(
            model_name='user',
            name='application_q',
            field=models.IntegerField(default=0, verbose_name='Application-Based Questions Asked'),
        ),
        migrations.AlterField(
            model_name='user',
            name='comprehensive_q',
            field=models.IntegerField(default=0, verbose_name='Comprehensive Questions Asked'),
        ),
        migrations.AlterField(
            model_name='user',
            name='evaluative_q',
            field=models.IntegerField(default=0, verbose_name='Evaluative Questions Asked'),
        ),
        migrations.AlterField(
            model_name='user',
            name='knowledge_q',
            field=models.IntegerField(default=0, verbose_name='Knowledge-Based Questions Asked'),
        ),
        migrations.AlterField(
            model_name='user',
            name='questions_asked',
            field=models.IntegerField(default=0, verbose_name='Number of Qyeustions Asked Asked'),
        ),
        migrations.AlterField(
            model_name='user',
            name='synthetic_q',
            field=models.IntegerField(default=0, verbose_name='Synthetic Questions Asked'),
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('coins_spent', models.IntegerField()),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.rewardshopitem')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Report',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('resolved', 'Resolved'), ('declined', 'Declined')], default='pending', max_length=10)),
                ('coins_deducted', models.IntegerField(default=10)),
                ('coins_awarded', models.IntegerField(default=10)),
                ('reported_answer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='core.answer')),
                ('reported_question', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='core.question')),
                ('reporting_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='answer',
            name='question',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='core.question'),
        ),
        migrations.AddField(
            model_name='answer',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='UserQuestionVote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('vote_type', models.CharField(choices=[('upvote', 'Upvote'), ('downvote', 'Downvote')], max_length=10)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.question')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'question')},
            },
        ),
        migrations.CreateModel(
            name='UserClassroomStats',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.IntegerField(default=0, verbose_name='Classroom Score')),
                ('coins', models.IntegerField(default=0, verbose_name='Classroom Coins')),
                ('rank', models.CharField(default='Novice Questioner', max_length=255, verbose_name='Classroom Rank')),
                ('classroom', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_stats', to='core.classroom')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='classroom_stats', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'classroom')},
            },
        ),
        migrations.CreateModel(
            name='UserAnswerVote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('vote_type', models.CharField(choices=[('upvote', 'Upvote'), ('downvote', 'Downvote')], max_length=10)),
                ('answer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.answer')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'answer')},
            },
        ),
        migrations.AddConstraint(
            model_name='report',
            constraint=models.UniqueConstraint(condition=models.Q(('reported_question__isnull', False)), fields=('reporting_user', 'reported_question'), name='unique_report_per_user_per_question'),
        ),
        migrations.AddConstraint(
            model_name='report',
            constraint=models.UniqueConstraint(condition=models.Q(('reported_answer__isnull', False)), fields=('reporting_user', 'reported_answer'), name='unique_report_per_user_per_answer'),
        ),
    ]
