# Page snapshot

```yaml
- generic [ref=e2]:
  - main [ref=e3]:
    - generic [ref=e5]:
      - heading "Login" [level=1] [ref=e6]
      - generic [ref=e7]: Email address "test@example.com" is invalid
      - generic [ref=e8]:
        - generic [ref=e9]:
          - generic [ref=e10]: Email
          - textbox "Email" [ref=e11]: test@example.com
        - button "Send Magic Link" [ref=e12] [cursor=pointer]
      - paragraph [ref=e14]: We'll send you a secure link to sign in without a password.
      - paragraph [ref=e15]:
        - text: Don't have an account?
        - link "Sign up" [ref=e16]:
          - /url: /signup
  - generic [ref=e17]: Login - Ganttiek
```