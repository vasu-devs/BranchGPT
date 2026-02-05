// Pre-built demo conversation to showcase branching and merging
// Scenario: Planning an unusual weekend trip (The Paradox of Choice)

export interface DemoMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  parentId: string | null;
  branchId: string;
  isHead: boolean;
  createdAt: Date;
  siblingCount: number;
  currentSiblingIndex: number;
}

export interface DemoBranch {
  id: string;
  name: string;
  messageCount: number;
  createdAt: Date;
  isMain?: boolean;
  parentBranchId: string | null;
  rootMessageId: string | null;
  isMerged?: boolean;
}

// Branch IDs
const MAIN_BRANCH = "demo-main";
const BRANCH_RELAX = "demo-relax";
const BRANCH_ADVENTURE = "demo-adventure";
const BRANCH_COMBINED = "demo-combined"; // Merged

// Message IDs
const MSG_ROOT = "demo-root";
const MSG_USER_1 = "demo-u1";
const MSG_AI_1 = "demo-a1";

// RELAX Branch
const MSG_USER_RELAX = "demo-u-relax";
const MSG_AI_RELAX = "demo-a-relax";

// ADVENTURE Branch
const MSG_USER_ADV = "demo-u-adv";
const MSG_AI_ADV = "demo-a-adv";
const MSG_USER_ADV_2 = "demo-u-adv-2";
const MSG_AI_ADV_2 = "demo-a-adv-2";

// MERGED Branch (Combining both)
const MSG_USER_MERGE = "demo-u-merge";
const MSG_AI_MERGE = "demo-a-merge";

const baseDate = new Date("2026-01-28T10:00:00Z");

export const demoBranches: DemoBranch[] = [
  {
    id: MAIN_BRANCH,
    name: "Weekend Plan",
    messageCount: 3,
    createdAt: baseDate,
    isMain: true,
    parentBranchId: null,
    rootMessageId: null,
    isMerged: false,
  },
  {
    id: BRANCH_RELAX,
    name: "Pure Relaxation",
    messageCount: 2,
    createdAt: new Date(baseDate.getTime() + 60000),
    isMain: false,
    parentBranchId: MAIN_BRANCH,
    rootMessageId: MSG_AI_1,
    isMerged: false,
  },
  {
    id: BRANCH_ADVENTURE,
    name: "Deep Adventure",
    messageCount: 4,
    createdAt: new Date(baseDate.getTime() + 120000),
    isMain: false,
    parentBranchId: MAIN_BRANCH,
    rootMessageId: MSG_AI_1,
    isMerged: false,
  },
  {
    id: BRANCH_COMBINED,
    name: "The Middle Path",
    messageCount: 2,
    createdAt: new Date(baseDate.getTime() + 180000),
    isMain: false,
    parentBranchId: BRANCH_RELAX, // Forked from Relax
    rootMessageId: MSG_AI_RELAX,
    isMerged: true, // SHOW MERGING
  },
];

export const demoMessages: DemoMessage[] = [
  // === MAIN BRANCH ===
  {
    id: MSG_ROOT,
    content: "You are a creative life coach. Help me think through decisions by exploring all options.",
    role: "system",
    parentId: null,
    branchId: MAIN_BRANCH,
    isHead: false,
    createdAt: baseDate,
    siblingCount: 1,
    currentSiblingIndex: 0,
  },
  {
    id: MSG_USER_1,
    content: "I have a free weekend coming up. Part of me wants to just sleep for 2 days, but another part wants to go hike a mountain. I feel stuck.",
    role: "user",
    parentId: MSG_ROOT,
    branchId: MAIN_BRANCH,
    isHead: false,
    createdAt: new Date(baseDate.getTime() + 1000),
    siblingCount: 1,
    currentSiblingIndex: 0,
  },
  {
    id: MSG_AI_1,
    content: `This is the classic "Rest vs. Experience" conflict. 
Thinking isn't linear—it's branching. We are allowed to explore both futures simultaneously before deciding.

Let's split this reality into two paths:
1.  **Path A**: You commit fully to recovery and stillness.
2.  **Path B**: You push your limits and seek awe in nature.

Which timeline do you want to visit first?`,
    role: "assistant",
    parentId: MSG_USER_1,
    branchId: MAIN_BRANCH,
    isHead: true,
    createdAt: new Date(baseDate.getTime() + 2000),
    siblingCount: 1,
    currentSiblingIndex: 0,
  },

  // === RELAX BRANCH ===
  {
    id: MSG_USER_RELAX,
    content: "Let's try the 'Do Nothing' path. What if I just stayed home?",
    role: "user",
    parentId: MSG_AI_1,
    branchId: BRANCH_RELAX,
    isHead: false,
    createdAt: new Date(baseDate.getTime() + 60000),
    siblingCount: 2, 
    currentSiblingIndex: 0,
  },
  {
    id: MSG_AI_RELAX,
    content: `You wake up late. No alarm. The sunlight hits the floor. You read that book you bought months ago. You order food.

**The Feeling:**
Your body repairs itself. The stress loops in your brain finally unspool. By Sunday night, you feel *soft* and rested, but perhaps a tiny bit restless.

*Was this enough? Or is there a voice asking for "The Middle Path"?*`,
    role: "assistant",
    parentId: MSG_USER_RELAX,
    branchId: BRANCH_RELAX,
    isHead: true,
    createdAt: new Date(baseDate.getTime() + 61000),
    siblingCount: 1,
    currentSiblingIndex: 0,
  },

  // === COMBINED BRANCH (Merged) ===
  {
    id: MSG_USER_MERGE,
    content: "You're right. Total stillness is boring. I want a mix. Let's merge these ideas.",
    role: "user",
    parentId: MSG_AI_RELAX, // Forked from Relax
    branchId: BRANCH_COMBINED,
    isHead: false,
    createdAt: new Date(baseDate.getTime() + 180000),
    siblingCount: 1,
    currentSiblingIndex: 0,
  },
  {
    id: MSG_AI_MERGE,
    content: `**The Synthesis.**

We take the "Sleep" from Branch A and the "Nature" from Branch B.

**The Plan:**
Drive to a cabin in the woods on Friday night.
*   **Saturday Morning**: Sleep in until 11 AM.
*   **Saturday Afternoon**: A gentle 2-hour hike (not a mountain climb).
*   **Sunday**: Reading by the fire.

*This branch is now closed as the final decision.*`,
    role: "assistant",
    parentId: MSG_USER_MERGE,
    branchId: BRANCH_COMBINED,
    isHead: true,
    createdAt: new Date(baseDate.getTime() + 181000),
    siblingCount: 1,
    currentSiblingIndex: 0,
  },

  // === ADVENTURE BRANCH (Active) ===
  {
    id: MSG_USER_ADV,
    content: "No, I need to feel alive. Let's explore the Mountain path.",
    role: "user",
    parentId: MSG_AI_1,
    branchId: BRANCH_ADVENTURE,
    isHead: false,
    createdAt: new Date(baseDate.getTime() + 120000),
    siblingCount: 2,
    currentSiblingIndex: 1,
  },
  {
    id: MSG_AI_ADV,
    content: `The air is cold. Your legs burn, but the view from the summit breaks your normal perspective. You feel small in a good way.

**The Feeling:**
You are exhausted physically, but your mind is crystal clear. The "problems" of last week seem irrelevant up here.

But... you have to drive home tired.`,
    role: "assistant",
    parentId: MSG_USER_ADV,
    branchId: BRANCH_ADVENTURE,
    isHead: false,
    createdAt: new Date(baseDate.getTime() + 121000),
    siblingCount: 1,
    currentSiblingIndex: 0,
  },
  {
    id: MSG_USER_ADV_2,
    content: "I'll take the exhaustion. That clarity is what I'm missing. This is the right path.",
    role: "user",
    parentId: MSG_AI_ADV,
    branchId: BRANCH_ADVENTURE,
    isHead: false,
    createdAt: new Date(baseDate.getTime() + 122000),
    siblingCount: 1,
    currentSiblingIndex: 0,
  },
  {
    id: MSG_AI_ADV_2,
    content: `Then we have an answer. 🏔️

This is why we branch: to simulate the regret of "what if" *before* we commit.

You explored the "Rest" path (seen in the **Relaxation** branch), realized it wasn't enough, and found your truth here.

Go pack your boots.`,
    role: "assistant",
    parentId: MSG_USER_ADV_2,
    branchId: BRANCH_ADVENTURE,
    isHead: true,
    createdAt: new Date(baseDate.getTime() + 123000),
    siblingCount: 1,
    currentSiblingIndex: 0,
  },
];

// Helper to get messages for a specific branch (up to and including its head)
export function getDemoMessagesForBranch(branchId: string): DemoMessage[] {
  const branchMessages = demoMessages.filter((m) => m.branchId === branchId);
  const branchHead = branchMessages.find((m) => m.isHead);

  if (!branchHead) return [];

  // Walk back from head to find full history
  const history: DemoMessage[] = [];
  let current: DemoMessage | undefined = branchHead;
  let steps = 0;
  while (current && steps < 100) {
    history.unshift(current);
    if (current.parentId) {
      current = demoMessages.find((m) => m.id === current!.parentId);
    } else {
      break;
    }
    steps++;
  }
  return history;
}

// Get head message of a branch
export function getDemoBranchHead(branchId: string): DemoMessage | null {
  return demoMessages.find((m) => m.branchId === branchId && m.isHead) || null;
}

// Get siblings for demo navigation
export function getDemoSiblings(messageId: string): {
  siblings: DemoMessage[];
  currentIndex: number;
} {
  const message = demoMessages.find((m) => m.id === messageId);
  if (!message || !message.parentId) {
    return { siblings: [message!], currentIndex: 0 };
  }
  const siblings = demoMessages.filter((m) => m.parentId === message.parentId);
  const currentIndex = siblings.findIndex((s) => s.id === messageId);
  return { siblings, currentIndex: currentIndex >= 0 ? currentIndex : 0 };
}
