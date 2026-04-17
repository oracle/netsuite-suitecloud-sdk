# Contributing to This Repository

We welcome contributions! There are multiple ways to contribute.

## Opening Issues

For bug reports or enhancement requests, file a GitHub issue unless the issue is
security-related. When filing a bug, remember: the clearer and more complete the report,
the more likely it is to be fixed. If you think you've found a security
vulnerability, do not open a GitHub issue. Instead, follow the instructions in our
[security policy](./SECURITY.md).

## Contributing Code

We welcome code contributions. Before submitting code via a pull request,
you must sign the [Oracle Contributor Agreement][OCA] (OCA). Your commits must include the following line, using the name and email address you used to sign the OCA:

```text
Signed-off-by: Your Name <you@example.org>
```

This can be added automatically to pull requests by committing with `--sign-off`
or `-s`, for example

```text
git commit --signoff
```

Only pull requests from contributors who can be verified as having signed the OCA can be accepted.

## Pull Request Process

1. Ensure there is an issue created to track and discuss the fix or enhancement
   you intend to submit.
2. Fork this repository.
3. Create a branch in your fork to implement the changes. We recommend using
   the issue number as part of your branch name, e.g. `1234-fixes`.
4. Ensure that any documentation is updated with the changes that are required
   by your change.
5. Ensure that any samples are updated if the base image has been changed.
6. Submit the pull request. *Do not leave the pull request blank*. Explain exactly
   what your changes are meant to do and provide simple steps on how to validate.
   your changes. Ensure that you reference the issue you created as well.
7. We will assign the pull request to 2-3 people for review before it is merged.

## Code of Conduct

Follow the [Golden Rule](https://en.wikipedia.org/wiki/Golden_Rule). For more specific guidelines, see the [Contributor Covenant Code of Conduct][COC].

[OCA]: https://oca.opensource.oracle.com
[COC]: https://www.contributor-covenant.org/version/1/4/code-of-conduct/
