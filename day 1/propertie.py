#  a small difference that the static method cannot access class members, whereas a class method can access the class members at a press.
# So that's why we can see that there's no parameter of a class that is passed.
# It's like a global function which is present.
def requires_authentication(func):
    def wrapper(user, *args, **kwargs):
        if not user.is_authenticated:
            raise PermissionError("User is not authenticated.")
        return func(user, *args, **kwargs)

    return wrapper


class User:
    def __init__(self, name, authenticated):
        self.name = name
        self.is_authenticated = authenticated


@requires_authentication
def view_dashboard(user):
    return f"Welcome to the dashboard, {user.name}!"


user = User("Alice", True)
print(view_dashboard(user))  # Output: Welcome to the dashboard, Alice!

unauthenticated_user = User("Bob", False)
print(view_dashboard(unauthenticated_user))  # Raises PermissionError