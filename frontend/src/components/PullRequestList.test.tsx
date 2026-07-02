// @vitest-environment jsdom

import { act } from 'react';
import type { ComponentProps } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import type { PullRequestSummary } from '../types';
import PullRequestList from './PullRequestList';

type ActEnvironment = typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

(globalThis as ActEnvironment).IS_REACT_ACT_ENVIRONMENT = true;

describe('PullRequestList ordering', () => {
  let root: ReturnType<typeof createRoot> | null = null;

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
      root = null;
    }
    document.body.innerHTML = '';
  });

  it('keeps regression rows ahead of lower-priority focus buckets', async () => {
    const updatedAt = new Date().toISOString();
    await renderPullRequestList([
      {
        pullRequest: pullRequest({ number: 1, title: 'Needs review row', updatedAt }),
        bucketLabel: 'Needs review',
      },
      {
        pullRequest: pullRequest({ number: 2, title: 'Regression row', updatedAt }),
        bucketLabel: 'Regression',
      },
    ]);

    expect(document.body.textContent).toContain('Regression row');
    expect(document.body.textContent).not.toContain('Needs review row');
  });

  async function renderPullRequestList(entries: ComponentProps<typeof PullRequestList>['entries']) {
    const host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    await act(async () => {
      root?.render(
        <PullRequestList
          entries={entries}
          limit={1}
          onSelectPullRequest={() => undefined}
        />,
      );
    });
  }
});

function pullRequest(overrides: Partial<PullRequestSummary>): PullRequestSummary {
  const now = new Date().toISOString();
  const number = overrides.number ?? 1;
  return {
    repository: 'microsoft/aspire',
    number,
    title: `PR ${number}`,
    state: 'open',
    draft: false,
    author: 'davidfowl',
    htmlUrl: `https://github.com/microsoft/aspire/pull/${number}`,
    createdAt: now,
    updatedAt: now,
    fetchedAt: now,
    labels: [],
    requestedReviewers: [],
    linkedIssues: [],
    commitCount: 1,
    additions: 10,
    deletions: 2,
    changedFiles: 1,
    lastCommitAt: now,
    headSha: 'abc123',
    baseRef: 'main',
    mergeableState: null,
    review: {
      state: 'waiting',
      reviewerCount: 0,
      approvalCount: 0,
      changesRequestedCount: 0,
      commentedReviewCount: 0,
      unresolvedThreadCount: 0,
      requiresConversationResolution: false,
    },
    checks: {
      state: 'success',
      totalCount: 1,
      successCount: 1,
      failureCount: 0,
      pendingCount: 0,
      neutralCount: 0,
      skippedCount: 0,
      completedAt: now,
      failingChecks: [],
    },
    ...overrides,
  };
}
