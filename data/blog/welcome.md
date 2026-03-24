---
title: "Welcome to the Research Blog"
slug: welcome
date: 2026-03-24
tags: [meta]
---

## Purpose

This blog serves as my research logbook for my MSc dissertation and broader work in stochastic calculus, numerical methods, and quantitative finance. Each post will typically contain:

1. A **mathematical proof** or derivation written in standard notation
2. An optional **Lean 4 formalisation** of the same result
3. Commentary connecting the result to the wider literature

## Example: Linearity of Expectation

We verify a foundational property used throughout the dissertation.

**Theorem.** Let $X, Y$ be integrable random variables on $(\Omega, \mathcal{F}, \mathbb{P})$ and let $a, b \in \mathbb{R}$. Then

$$\mathbb{E}[aX + bY] = a\,\mathbb{E}[X] + b\,\mathbb{E}[Y].$$

*Proof.* By definition of the Lebesgue integral,

$$\mathbb{E}[aX + bY] = \int_\Omega (aX + bY)\, d\mathbb{P} = a\int_\Omega X\, d\mathbb{P} + b\int_\Omega Y\, d\mathbb{P} = a\,\mathbb{E}[X] + b\,\mathbb{E}[Y],$$

where the second equality follows from linearity of the Lebesgue integral. $\square$

## Optional: Lean Formalisation

```lean
theorem linearity_of_expectation
    {X Y : Ω → ℝ} (hX : Integrable X μ) (hY : Integrable Y μ)
    (a b : ℝ) :
    ∫ ω, (a * X ω + b * Y ω) ∂μ = a * ∫ ω, X ω ∂μ + b * ∫ ω, Y ω ∂μ := by
  rw [integral_add (hX.const_mul a) (hY.const_mul b),
      integral_mul_left, integral_mul_left]
```

This is the pattern I will follow for each entry going forward.
