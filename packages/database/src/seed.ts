import "dotenv/config";
import { prisma } from "./client";

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

(async () => {
  try {
    // Delete existing problems to start fresh
    await prisma.submission.deleteMany({});
    await prisma.contestProblem.deleteMany({});
    await prisma.testCase.deleteMany({});
    await prisma.example.deleteMany({});
    await prisma.constraints.deleteMany({});
    await prisma.problem.deleteMany({});

    console.log("Creating problems...");

    // Problem 1: Two Sum
    const twoSum = await prisma.problem.create({
      data: {
        title: "Two Sum",
        slug: generateSlug("Two Sum"),
        description: `Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
        difficulty: "EASY",
        starterCodeJavaScript: `function twoSum(nums, target) {
  // Write your solution here
  // Return an array of two indices [i, j]
  // where nums[i] + nums[j] == target
}`,
        starterCodePython: `def twoSum(nums, target):
    # Write your solution here
    # Return a list of two indices [i, j]
    # where nums[i] + nums[j] == target
    pass`,
        isPublic: true,
        examples: {
          create: [
            {
              input: "[2, 7, 11, 15]\\n9",
              output: "[0, 1]",
              explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
            },
            {
              input: "[3, 2, 4]\\n6",
              output: "[1, 2]",
              explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
            },
            {
              input: "[3, 3]\\n6",
              output: "[0, 1]",
              explanation: "Because nums[0] + nums[1] == 6, we return [0, 1].",
            },
          ],
        },
        constraints: {
          create: [
            { description: "2 ≤ nums.length ≤ 10⁴" },
            { description: "-10⁹ ≤ nums[i] ≤ 10⁹" },
            { description: "-10⁹ ≤ target ≤ 10⁹" },
            { description: "Only one valid answer exists." },
          ],
        },
        testCases: {
          create: [
            // Sample cases
            {
              input: "[2, 7, 11, 15]\\n9",
              output: "[0, 1]",
              isSample: true,
            },
            {
              input: "[3, 2, 4]\\n6",
              output: "[1, 2]",
              isSample: true,
            },
            {
              input: "[3, 3]\\n6",
              output: "[0, 1]",
              isSample: true,
            },
            // Edge cases
            {
              input: "[2, 3]\\n5",
              output: "[0, 1]",
              isSample: false,
            },
            {
              input: "[-1, -2, -3, -4, -5]\\n-8",
              output: "[3, 4]",
              isSample: false,
            },
            {
              input: "[-1, 0, 1, 2, -1, -4]\\n0",
              output: "[0, 2]",
              isSample: false,
            },
            {
              input: "[1000000000, 1]\\n1000000001",
              output: "[0, 1]",
              isSample: false,
            },
            {
              input: "[-1000000000, -1000000000]\\n-2000000000",
              output: "[0, 1]",
              isSample: false,
            },
          ],
        },
      },
    });

    console.log(`Created: ${twoSum.title}`);

    // Problem 2: Valid Parentheses
    const validParentheses = await prisma.problem.create({
      data: {
        title: "Valid Parentheses",
        slug: generateSlug("Valid Parentheses"),
        description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
        difficulty: "EASY",
        starterCodeJavaScript: `function isValid(s) {
  // Write your solution here
  // Return true if valid, false otherwise
}`,
        starterCodePython: `def isValid(s):
    # Write your solution here
    # Return True if valid, False otherwise
    pass`,
        isPublic: true,
        examples: {
          create: [
            {
              input: '"()"',
              output: "true",
              explanation: "The brackets are properly closed.",
            },
            {
              input: '"()[]{}"',
              output: "true",
              explanation: "All brackets are properly closed in order.",
            },
            {
              input: '"(]"',
              output: "false",
              explanation: "The brackets are not properly closed.",
            },
          ],
        },
        constraints: {
          create: [
            { description: "1 ≤ s.length ≤ 10⁴" },
            { description: "s consists of parentheses only '()[]{}'" },
          ],
        },
        testCases: {
          create: [
            // Sample cases
            { input: '"()"', output: "true", isSample: true },
            { input: '"()[]{}"', output: "true", isSample: true },
            { input: '"(]"', output: "false", isSample: true },
            // Edge cases
            { input: '"([)]"', output: "false", isSample: false },
            { input: '"{[]}"', output: "true", isSample: false },
            { input: '""', output: "true", isSample: false },
            { input: '"((((()))))"', output: "true", isSample: false },
            { input: '"({[]})"', output: "true", isSample: false },
            { input: '"({[}])"', output: "false", isSample: false },
            { input: '"("', output: "false", isSample: false },
            { input: '")"', output: "false", isSample: false },
            { input: '"]"', output: "false", isSample: false },
            { input: '"[({})]"', output: "true", isSample: false },
          ],
        },
      },
    });

    console.log(`Created: ${validParentheses.title}`);

    // Problem 3: Longest Substring Without Repeating Characters
    const longestSubstring = await prisma.problem.create({
      data: {
        title: "Longest Substring Without Repeating Characters",
        slug: generateSlug("Longest Substring Without Repeating Characters"),
        description: `Given a string s, find the length of the longest substring without repeating characters.`,
        difficulty: "MEDIUM",
        starterCodeJavaScript: `function lengthOfLongestSubstring(s) {
  // Write your solution here
  // Return the length of longest substring without repeating characters
}`,
        starterCodePython: `def lengthOfLongestSubstring(s):
    # Write your solution here
    # Return the length of longest substring without repeating characters
    pass`,
        isPublic: true,
        examples: {
          create: [
            {
              input: '"abcabcbb"',
              output: "3",
              explanation: 'The answer is "abc", with the length of 3.',
            },
            {
              input: '"bbbbb"',
              output: "1",
              explanation: 'The answer is "b", with the length of 1.',
            },
            {
              input: '"pwwkew"',
              output: "3",
              explanation: 'The answer is "wke", with the length of 3.',
            },
          ],
        },
        constraints: {
          create: [
            { description: "0 ≤ s.length ≤ 5 × 10⁴" },
            {
              description:
                "s consists of English letters, digits, symbols and spaces.",
            },
          ],
        },
        testCases: {
          create: [
            // Sample cases
            { input: '"abcabcbb"', output: "3", isSample: true },
            { input: '"bbbbb"', output: "1", isSample: true },
            { input: '"pwwkew"', output: "3", isSample: true },
            // Edge cases
            { input: '""', output: "0", isSample: false },
            { input: '"a"', output: "1", isSample: false },
            { input: '"au"', output: "2", isSample: false },
            {
              input: '"abcdefghijklmnopqrstuvwxyz"',
              output: "26",
              isSample: false,
            },
            { input: '"abcdefgabcdefg"', output: "7", isSample: false },
            { input: '" "', output: "1", isSample: false },
            { input: '"aab"', output: "2", isSample: false },
            { input: '"dvdf"', output: "3", isSample: false },
            { input: '"au"', output: "2", isSample: false },
            { input: '"aac"', output: "2", isSample: false },
          ],
        },
      },
    });

    console.log(`Created: ${longestSubstring.title}`);

    // Problem 4: Container With Most Water
    const containerWithMostWater = await prisma.problem.create({
      data: {
        title: "Container With Most Water",
        slug: generateSlug("Container With Most Water"),
        description: `You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum area of water a container can store.

Notice that you may not slant the container.`,
        difficulty: "MEDIUM",
        starterCodeJavaScript: `function maxArea(height) {
  // Write your solution here
  // Return the maximum area of water container can hold
}`,
        starterCodePython: `def maxArea(height):
    # Write your solution here
    # Return the maximum area of water container can hold
    pass`,
        isPublic: true,
        examples: {
          create: [
            {
              input: "[1, 8, 6, 2, 5, 4, 8, 3, 7]",
              output: "49",
              explanation:
                "The vertical lines are at indices 1 and 8. Area = min(8, 7) * (8 - 1) = 49.",
            },
            {
              input: "[1, 1]",
              output: "1",
              explanation:
                "The vertical lines are at indices 0 and 1. Area = min(1, 1) * (1 - 0) = 1.",
            },
          ],
        },
        constraints: {
          create: [
            { description: "n == height.length" },
            { description: "2 ≤ n ≤ 10⁵" },
            { description: "0 ≤ height[i] ≤ 10⁴" },
          ],
        },
        testCases: {
          create: [
            // Sample cases
            {
              input: "[1, 8, 6, 2, 5, 4, 8, 3, 7]",
              output: "49",
              isSample: true,
            },
            {
              input: "[1, 1]",
              output: "1",
              isSample: true,
            },
            // Edge cases
            {
              input: "[2, 3, 4, 5, 18, 17, 6]",
              output: "17",
              isSample: false,
            },
            {
              input: "[0, 0]",
              output: "0",
              isSample: false,
            },
            {
              input: "[10000, 10000]",
              output: "10000",
              isSample: false,
            },
            {
              input: "[4, 3, 2, 1, 4]",
              output: "16",
              isSample: false,
            },
            {
              input: "[1, 2, 1]",
              output: "2",
              isSample: false,
            },
            {
              input: "[2, 1, 2]",
              output: "2",
              isSample: false,
            },
            {
              input: "[1, 2, 4, 3]",
              output: "4",
              isSample: false,
            },
          ],
        },
      },
    });

    console.log(`Created: ${containerWithMostWater.title}`);

    // Problem 5: Reverse Integer
    const reverseInteger = await prisma.problem.create({
      data: {
        title: "Reverse Integer",
        slug: generateSlug("Reverse Integer"),
        description: `Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2³¹, 2³¹ - 1], then return 0.

Assume the environment does not allow you to store 64-bit integers (signed or unsigned).`,
        difficulty: "MEDIUM",
        starterCodeJavaScript: `function reverse(x) {
  // Write your solution here
  // Return the reversed integer
  // Return 0 if it overflows 32-bit signed integer range
}`,
        starterCodePython: `def reverse(x):
    # Write your solution here
    # Return the reversed integer
    # Return 0 if it overflows 32-bit signed integer range
    pass`,
        isPublic: true,
        examples: {
          create: [
            {
              input: "123",
              output: "321",
              explanation: "The digits of 123 are reversed to get 321.",
            },
            {
              input: "-123",
              output: "-321",
              explanation: "The digits of -123 are reversed to get -321.",
            },
            {
              input: "120",
              output: "21",
              explanation:
                "The digits of 120 are reversed to get 21 (trailing zeros are dropped).",
            },
            {
              input: "0",
              output: "0",
              explanation: "Reversing 0 returns 0.",
            },
          ],
        },
        constraints: {
          create: [{ description: "-2³¹ ≤ x ≤ 2³¹ - 1" }],
        },
        testCases: {
          create: [
            // Sample cases
            { input: "123", output: "321", isSample: true },
            { input: "-123", output: "-321", isSample: true },
            { input: "120", output: "21", isSample: true },
            { input: "0", output: "0", isSample: true },
            // Edge cases
            { input: "1534236469", output: "0", isSample: false },
            { input: "-2147483648", output: "0", isSample: false },
            { input: "2147483647", output: "0", isSample: false },
            { input: "1", output: "1", isSample: false },
            { input: "-1", output: "-1", isSample: false },
            { input: "100", output: "1", isSample: false },
            { input: "1000", output: "1", isSample: false },
            { input: "9", output: "9", isSample: false },
            { input: "-9", output: "-9", isSample: false },
          ],
        },
      },
    });

    console.log(`Created: ${reverseInteger.title}`);

    // Problem 6: Median of Two Sorted Arrays
    const medianOfTwoSortedArrays = await prisma.problem.create({
      data: {
        title: "Median of Two Sorted Arrays",
        slug: generateSlug("Median of Two Sorted Arrays"),
        description: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).`,
        difficulty: "HARD",
        starterCodeJavaScript: `function findMedianSortedArrays(nums1, nums2) {
  // Write your solution here
  // Return the median as a number
  // Achieve O(log(m+n)) complexity
}`,
        starterCodePython: `def findMedianSortedArrays(nums1, nums2):
    # Write your solution here
    # Return the median as a number
    # Achieve O(log(m+n)) complexity
    pass`,
        isPublic: true,
        examples: {
          create: [
            {
              input: "[1, 3]\\n[2]",
              output: "2.0",
              explanation: "merged array = [1, 2, 3] and median is 2.",
            },
            {
              input: "[1, 2]\\n[3, 4]",
              output: "2.5",
              explanation:
                "merged array = [1, 2, 3, 4] and median is (2 + 3) / 2 = 2.5.",
            },
          ],
        },
        constraints: {
          create: [
            { description: "nums1.length == m" },
            { description: "nums2.length == n" },
            { description: "0 ≤ m ≤ 1000" },
            { description: "0 ≤ n ≤ 1000" },
            { description: "1 ≤ m + n ≤ 2000" },
            { description: "-10⁶ ≤ nums1[i], nums2[j] ≤ 10⁶" },
          ],
        },
        testCases: {
          create: [
            // Sample cases
            {
              input: "[1, 3]\\n[2]",
              output: "2.0",
              isSample: true,
            },
            {
              input: "[1, 2]\\n[3, 4]",
              output: "2.5",
              isSample: true,
            },
            // Edge cases
            {
              input: "[]\\n[1]",
              output: "1.0",
              isSample: false,
            },
            {
              input: "[2]\\n[]",
              output: "2.0",
              isSample: false,
            },
            {
              input: "[0, 0]\\n[0, 0]",
              output: "0.0",
              isSample: false,
            },
            {
              input: "[-1, -1]\\n[-1, -1]",
              output: "-1.0",
              isSample: false,
            },
            {
              input: "[1, 3, 8, 9, 15]\\n[7, 11, 18, 19, 21, 25]",
              output: "11.0",
              isSample: false,
            },
            {
              input: "[1]\\n[2, 3, 4, 5, 6]",
              output: "3.5",
              isSample: false,
            },
            {
              input: "[-2, -1]\\n[3]",
              output: "-1.0",
              isSample: false,
            },
          ],
        },
      },
    });

    console.log(`Created: ${medianOfTwoSortedArrays.title}`);

    console.log("\n✅ Database seeded successfully!");
    console.log("Problems created:");
    console.log("  1. Two Sum (EASY)");
    console.log("  2. Valid Parentheses (EASY)");
    console.log("  3. Longest Substring Without Repeating Characters (MEDIUM)");
    console.log("  4. Container With Most Water (MEDIUM)");
    console.log("  5. Reverse Integer (MEDIUM)");
    console.log("  6. Median of Two Sorted Arrays (HARD)");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
