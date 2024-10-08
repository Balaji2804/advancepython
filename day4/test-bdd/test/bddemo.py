"""Basic arithmetic operations feature tests."""

from pytest_bdd import (
    given,
    scenario,
    then,
    when,
)


@scenario('test\bddemo.feature', 'Adding two numbers')
def test_adding_two_numbers():
    """Adding two numbers."""


@scenario('test\bddemo.feature', 'Subtracting two numbers')
def test_subtracting_two_numbers():
    """Subtracting two numbers."""


@given('I have numbers 2 and 3')
def _():
    """I have numbers 2 and 3."""
    raise NotImplementedError


@given('I have numbers 5 and 3')
def _():
    """I have numbers 5 and 3."""
    raise NotImplementedError


@when('I add them')
def _():
    """I add them."""
    raise NotImplementedError


@when('I subtract them')
def _():
    """I subtract them."""
    raise NotImplementedError


@then('the result should be 2')
def _():
    """the result should be 2."""
    raise NotImplementedError


@then('the result should be 5')
def _():
    """the result should be 5."""
    raise NotImplementedError

