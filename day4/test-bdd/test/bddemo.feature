Feature: Basic arithmetic operations

  Scenario: Adding two numbers
    Given I have numbers 2 and 3
    When I add them
    Then the result should be 5

  Scenario: Subtracting two numbers
    Given I have numbers 5 and 3
    When I subtract them
    Then the result should be 2
