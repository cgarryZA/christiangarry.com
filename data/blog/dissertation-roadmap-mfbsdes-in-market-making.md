---
title: "Dissertation Roadmap: MFBSDEs in Market Making"
slug: dissertation-roadmap-mfbsdes-in-market-making
date: 2026-03-24
---

## 1. Introduction & Related Work
*~3–4 pages*

Frame the Jane Street problem: $N$ algorithmic traders whose collective actions
distort the market dynamics they are trading against (market impact). Establish
why this is hard, why it matters, and why existing tools are insufficient alone.

**Papers for this section:**
- [Cont & Xiong](https://onlinelibrary.wiley.com/doi/10.1111/mafi.12401) — financial grounding, market making under inventory risk
- [Buckdahn, Djehiche, Li & Peng](https://projecteuclid.org/journals/annals-of-probability/volume-37/issue-4/Mean-field-backward-stochastic-differential-equations-A-limit-approach/10.1214/08-AOP442.full) — $N$-agent convergence to mean-field limit
- [Buckdahn, Li & Peng](https://www.sciencedirect.com/science/article/pii/S030441490900088X) — existence & uniqueness of MFBSDE solutions
- [Guo et al.](https://arxiv.org/abs/2003.06069) — deep RL as a computational bridge

**Research question to land on:**
> How computationally stable are deep learning methods when approximating the
> true viscosity solutions of Mean-Field BSDEs in high-volatility market making
> scenarios?

---

## 2. Mathematical Framework
*~4–5 pages — the Feng chapter*

**Flow:** $N$-agent FBSDE system → mean-field limit → viscosity solution result

Define the coupled Forward-Backward system for $N$ traders. Use
[Buckdahn, Djehiche, Li & Peng](https://projecteuclid.org/journals/annals-of-probability/volume-37/issue-4/Mean-field-backward-stochastic-differential-equations-A-limit-approach/10.1214/08-AOP442.full) to show convergence to the McKean–Vlasov
MFBSDE as $N \to \infty$, with convergence rate $1/\sqrt{N}$:

$$Y_t = g(X_T, \mu_T) + \int_t^T f(s, X_s, \mu_s, Y_s, Z_s)\, ds - \int_t^T Z_s\, dW_s$$

Then cite [Buckdahn, Li & Peng](https://www.sciencedirect.com/science/article/pii/S030441490900088X) to establish that $Y_t = u(t, X_t, \mu_t)$
is the **unique viscosity solution** to the non-local PDE. This is the
mathematical target the neural network will later try — and eventually fail — to
hit.

**Papers for this section:**
- [Buckdahn, Djehiche, Li & Peng](https://projecteuclid.org/journals/annals-of-probability/volume-37/issue-4/Mean-field-backward-stochastic-differential-equations-A-limit-approach/10.1214/08-AOP442.full) — $1/\sqrt{N}$ convergence
- [Buckdahn, Li & Peng](https://www.sciencedirect.com/science/article/pii/S030441490900088X) — viscosity solution uniqueness (Peng)
- [Cont & Xiong](https://onlinelibrary.wiley.com/doi/10.1111/mafi.12401) — financial interpretation of $Y_t$ as the value function

---

## 3. Numerical Methodology
*~4–5 pages — the Siemens chapter*

**Flow:** architecture → loss function → why this should work

Approximate $Z_t$ (the hedging process) with a feedforward network
$\mathcal{Z}_\theta$. Discretise on a uniform grid via Euler–Maruyama.
Train to minimise terminal discrepancy:

$$\mathcal{L}(\theta) = \mathbb{E}\left[\left|Y_{t_N}^\theta - g(X_T,\mu_T)\right|^2\right]$$

The mean-field coupling enters by approximating $\mu_t$ from a batch of
simulated paths. **All code lives in the appendix / GitHub — this section is
architecture only.**

**Papers for this section:**
- [Guo et al.](https://arxiv.org/abs/2003.06069) — Deep BSDE solver design
- [E, Han & Jentzen](https://arxiv.org/abs/1706.04702) — original deep BSDE framework
- [Buckdahn, Li & Peng](https://www.sciencedirect.com/science/article/pii/S030441490900088X) — what the network is mathematically obligated to converge to

---

## 4. Empirical Results & Stress Testing
*~5–6 pages — the distinction chapter*

**Flow:** base case works → turn up the dial → find the breaking point → diagnose why

### 4.1 Base Case
Low volatility, linear market impact, moderate $N$. Validate the solver against
the known analytical approximation. Confirm the implementation is correct before
stressing it.

### 4.2 Stress Test — finding the breaking point
Systematically increase:
- $\sigma$ (volatility)
- Non-linear impact: $\lambda|q|^\alpha$, $\alpha > 1$
- Reduce $N$ to stress the $1/\sqrt{N}$ approximation error

*At what boundary does the solver cease to track Peng's viscosity solution bounds?*

### 4.3 Mathematical Diagnosis of Failure
A negative result with a diagnosis is the target. Candidate failure modes:
- Gradient variance explosion in the $Z$-network
- $1/\sqrt{N}$ finite-$N$ fluctuations overwhelming the mean-field approximation
- Loss landscape flatness trapping the optimiser

**Papers for this section:**
- [Buckdahn, Li & Peng](https://www.sciencedirect.com/science/article/pii/S030441490900088X) — viscosity bounds to measure failure against
- [Guo et al.](https://arxiv.org/abs/2003.06069) — known failure modes in deep BSDE literature
- [Buckdahn, Djehiche, Li & Peng](https://projecteuclid.org/journals/annals-of-probability/volume-37/issue-4/Mean-field-backward-stochastic-differential-equations-A-limit-approach/10.1214/08-AOP442.full) — why $1/\sqrt{N}$ becomes the weak link

---

## 5. Conclusion & Future Work
*~1 page*

Summarise the empirical stability boundary found. Then plant the Oxford hook:
state the **exact lemma** that would, if proved, stabilise the neural network
beyond the observed breaking point. This is the gift to the admissions committee
— a precise open problem, not a vague gesture toward future research.
