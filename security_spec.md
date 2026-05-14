# Security Specification - Artisan App

## Data Invariants
- A user can only access their own profile (PII protection).
- A product listing can only be modified by the seller who created it.
- Material tracking logs are private to the user who created them.
- All documents must have valid IDs matching the regex `^[a-zA-Z0-9_\\-]+$`.
- Timestamps must be server-generated.

## The Dirty Dozen Payloads (Identity & Integrity Attack Surface)

1. **Identity Spoofing**: Attempt to create a user profile with a different `userId`.
2. **Ghost Field Injection**: Attempt to add `isAdmin: true` to a user profile.
3. **PII Leak**: Attempt to read another user's profile with sensitive data.
4. **Orphaned Record**: Attempt to create a product without a valid seller.
5. **State Shortcut**: Attempt to update a material tracker's `userId` after creation.
6. **Resource Exhaustion (Large String)**: Attempt to set a name to a 1MB string.
7. **Resource Exhaustion (ID Poisoning)**: Attempt to use a 1KB document ID.
8. **Privilege Escalation**: Attempt to update a product listing owned by another user.
9. **Type Mixup**: Attempt to set `price` as a string instead of a number.
10. **Array Overload**: Attempt to add 1 million favorites to a user profile.
11. **Future Timestamp**: Attempt to set `createdAt` to a date in the future (client-side timestamp).
12. **Bypass Relational Gate**: Attempt to create a material tracking log for a non-existent product.

## Deployment Checklist
- [ ] isValidId() applied to all document paths.
- [ ] isValid[Entity]() helper called on all writes.
- [ ] affectedKeys().hasOnly() used for all updates.
- [ ] request.auth.token.email_verified mandated for sensitive writes.
- [ ] PII isolated or strictly restricted.
