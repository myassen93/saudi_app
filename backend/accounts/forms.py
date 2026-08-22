from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit
from django import forms
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _

from .models import User


class UserCreateForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, label=_("كلمة المرور"))

    class Meta:
        model = User
        fields = ["username", "password", "gender"]
        labels = {"username": _("اسم المستخدم"), "gender": _("الجنس")}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = "post"
        self.helper.add_input(Submit("submit", _("إضافة")))

    def clean_password(self):
        password = self.cleaned_data["password"]
        validate_password(password)
        return password

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user


class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["username", "gender", "is_active"]
        labels = {"username": _("اسم المستخدم"), "gender": _("الجنس"), "is_active": _("نشط")}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = "post"
        self.helper.add_input(Submit("submit", _("حفظ")))


class OTPTokenForm(forms.Form):
    otp_token = forms.CharField(
        label=_("رمز التحقق"),
        max_length=6,
        min_length=6,
        widget=forms.TextInput(
            attrs={"inputmode": "numeric", "autocomplete": "one-time-code", "autofocus": True}
        ),
    )
    next = forms.CharField(widget=forms.HiddenInput, required=False)

    def __init__(self, *args, submit_label=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = "post"
        self.helper.add_input(Submit("submit", submit_label or _("تأكيد")))
