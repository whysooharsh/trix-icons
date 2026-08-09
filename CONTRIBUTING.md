# CONTRIBUTING.md — trix-icons

## Who This Is For

Anyone who wants to add icons, fix bugs, improve documentation, or improve the tooling.

Read this document before opening a pull request.

---

## The Quality Standard

trix-icons is a quality-first project. We would rather have 15 excellent icons than 150 mediocre ones.

A contribution is not judged by quantity. It is judged by:

1. Is the animation meaningful?
2. Is the engineering correct?
3. Is the provenance documented?
4. Does it pass every quality gate?

Contributions that do not meet the standard will be asked to revise, not rejected.

---

## What Kinds of Contributions Are Welcome

| Contribution | Notes |
|-------------|-------|
| New original UI icons | Must pass full quality gates |
| New brand icon treatments | Provenance must be documented; will be reviewed carefully |
| Bug fixes to existing animations | Describe the incorrect behavior and the fix |
| Improvements to existing animations | Describe why the new animation is better |
| Documentation improvements | Must add real information, not restate what's already there |
| Tooling improvements (scripts, CI) | Must not break existing behavior |
| CLI improvements | Major behavior changes require a design discussion first |
| Registry schema changes | Breaking changes require a design discussion first |

### What is not accepted

- Large batches of AI-generated icons without individual design justification
- Icons where the animation is a generic effect (scale + rotate + spring) not derived from the icon's meaning
- Brand icons with undocumented or false licensing claims
- Placeholder implementations that appear complete but don't function
- Documentation that exists only to have more markdown files
- Dependencies added without the analysis required by ARCHITECTURE.md

---

## Contribution Process

### For a new icon

1. **Read ICON_AUTHORING.md** completely.

2. **Complete the design brief** for your icon. Be able to answer every question before writing code.

3. **Create the icon source files:**
   ```
   icons/<category>/<name>/icon.svg
   icons/<category>/<name>/meta.json
   ```

4. **Create the component:**
   ```
   packages/icons/src/<category>/<Name>Icon.tsx
   ```

5. **Run all validation:**
   ```bash
   npm run icons:validate
   npm run typecheck
   npm run registry:build
   npm run registry:validate
   ```

6. **Perform visual QA** at 16px, 20px, 24px, 32px, 48px.

7. **Open a pull request** using the icon PR template.

### For a bug fix or improvement

1. Describe the current behavior and the problem.
2. Describe the expected behavior.
3. Make the smallest change that fixes the issue.
4. Run `npm run typecheck && npm run test`.
5. Open a pull request.

---

## Pull Request Template — New Icon

Your PR description must answer these questions:

```markdown
## Icon: <name>

### What does this icon represent?

### What animates and why?

### Animation technique used:

### Source of base artwork:

### License:

### Is this a trademark?
[ ] Yes — owner: _____, reviewed: _____
[ ] No

### Checklist
- [ ] Design brief completed
- [ ] icon.svg meets SVG requirements (see ICON_AUTHORING.md)
- [ ] meta.json is complete
- [ ] Component implements AnimatedIconProps
- [ ] AnimatedIconHandle ref is implemented
- [ ] prefers-reduced-motion is handled
- [ ] Visual QA at 16px, 24px, 48px
- [ ] npm run typecheck passes
- [ ] npm run icons:validate passes
- [ ] npm run registry:build passes
```

PRs missing this information will be asked to complete it before review.

---

## Code Style

The project uses TypeScript. Follow the existing patterns in `packages/icons/src/`.

No formatter is enforced at Phase 1. This will be added at Phase 2. Write readable code.

Rules that matter:

- No `any` in public interfaces
- No empty catch blocks
- No silent fallbacks for invalid input
- Error messages must explain what happened, why, and what to do
- Comments should explain why, not what (the code shows what)

---

## Commit Style

Use conventional commits:

```
feat(icons): add DownloadIcon with directional translate animation
fix(icons): correct reset behavior in MailIcon on interrupted hover
docs: update ANIMATION_GUIDELINES with opacity rules
chore(registry): regenerate after adding DownloadIcon
```

---

## A Note on AI Assistance

AI tools are permitted and expected.

AI assistance is fine for:
- Scaffolding component files
- Writing boilerplate
- Generating SVG path variations
- Drafting documentation
- Running validation

AI assistance is not a substitute for:
- Design judgment
- Animation intent
- Provenance research
- Visual QA
- Human review of brand marks

If you used AI to generate an icon, you are still responsible for every decision in it. Review it as if you wrote it yourself.

A contribution where the animation is generic (scale + bounce) and the design brief questions are answered with one-word responses will not pass review, regardless of how it was generated.

---

## Maintainer Review

Maintainers will check:

1. Does the animation derive from the icon's meaning?
2. Does it pass all automated gates?
3. Is the provenance documented correctly?
4. Is the code understandable without the AI that wrote it?
5. Is reduced motion handled?
6. Does the visual QA look correct?

Review may take time. We prioritize quality over speed.
