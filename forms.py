from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, PasswordField, BooleanField
from wtforms.validators import DataRequired, Length, ValidationError, EqualTo
from models import get_user


class SignupForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired(), Length(max=64)])
    password = PasswordField('Password', validators=[DataRequired()])
    password2 = PasswordField('Repeat password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Register')

    def validate_name(self, name):
        user = get_user(name.data)
        if user is not None:
            raise ValidationError('Sorry, that username is already in use. Choose another one')

# Formulario para poder loggearse
class LoginForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember me')
    submit = SubmitField('Log in')

    def validate_name(self, name):
        user = get_user(name.data)
        if user is None:
            raise ValidationError("Sorry, that username doesn't exist")
        else:
            return True

    def validate_password(self, password):
        user = get_user(self.name.data)

        if user is None: #Username was not valid and it doesn't exist
            raise ValidationError("")
        print('FORMS: passwd que me llega: ', password.data)
        if not user.check_password(password.data):
            print('FORMS: según models el check psasword da incorrect', user.check_password(password.data))
            raise ValidationError("Password is not correct. Try again")

# Form to change your password in your profile page
class EditProfileForm(FlaskForm):
    name = StringField('Username')
    oldpassword = PasswordField('Current password', validators=[DataRequired()])
    password = PasswordField('New password', validators=[DataRequired()])
    password2 = PasswordField('Repeat new password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Set new password')
    
    def validate_oldpassword(self, oldpassword):
        user = get_user(self.name.data)
        if user is None: #Username was not valid and it doesn't exist
            raise ValidationError("")
        if not user.check_password(oldpassword.data):
            raise ValidationError("Password is not correct. Try again")
    