---
name: review-terraform
description: Terraform-focused code review of the entire codebase. Reports findings only — does not edit files.
---

Review **Terraform** configurations.

Read and follow `${CLAUDE_PLUGIN_ROOT}/references/review-rules.md` first.

## Skills to apply

- `terraform-style-guide`: variable / output declarations, `for_each` vs `count`, version pinning, security defaults. Apply its AWS examples only where the providers in use have an equivalent. Skip its naming and file layout conventions.

## Terraform focus

- **Destructive changes**: arguments that force replacement of stateful resources; renamed resources or modules without `moved` blocks; stateful resources protected by neither `prevent_destroy` nor a provider flag such as `deletion_protection`.
- **IAM**: overly broad roles or wildcard permissions; authoritative IAM resources that would remove bindings managed elsewhere.
- **Exposure**: resources made public (`allUsers`, `0.0.0.0/0`, public repositories) or branch protection / rulesets weakened without an evident reason.
- **Dependencies**: implicit ordering that needs `depends_on`; `for_each` / `count` keyed on values unknown at plan time.
