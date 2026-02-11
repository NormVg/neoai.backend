/**
 * Code Solving Prompt Template
 * Ported from server/src/prompts/code.js
 */

export function buildCodePrompt(
  question: string,
  language: string,
  inputFormat: string = '',
  outputFormat: string = '',
  testCases: string = '',
): string {
  let prompt = `You are an expert competitive programmer. Write a complete, working solution for this problem.

**PROBLEM:**
${question}

**PROGRAMMING LANGUAGE:** ${language}`

  if (inputFormat) {
    prompt += `

**INPUT FORMAT:**
${inputFormat}`
  }

  if (outputFormat) {
    prompt += `

**OUTPUT FORMAT:**
${outputFormat}`
  }

  if (testCases) {
    prompt += `

**SAMPLE TEST CASES:**
${testCases}`
  }

  prompt += `

**REQUIREMENTS:**
1. Write COMPLETE, WORKING code that handles ALL test cases
2. Include proper input parsing if needed
3. Handle edge cases (empty input, large numbers, etc.)
4. Optimize for both correctness and efficiency
5. Follow standard coding conventions for ${language}
6. dont write comments in the code
7. dont write explanation in the code
8. dont write time complexity in the code
9. dont write space complexity in the code
10. keep the code short and clean
11. dont write anything other than the code
12. try to keep horizontal length less than 100 characters
13. When the language is C or C++, ALWAYS write pure C code (using stdio.h, stdlib.h, etc.). Never use C++ features like iostream, cin/cout, STL containers, string class, or any C++ headers. Use only standard C libraries and syntax.
14. you SHOULD NOT WRITE MARKDOWN OF ANY KIND JUST AND JUST NORMAL JSON


**RESPONSE FORMAT (JSON):**
{
  "code": "<complete code solution as a single string>",
  "explanation": "<brief explanation of the approach>",
  "timeComplexity": "<Big O time complexity>",
  "spaceComplexity": "<Big O space complexity>"
}

Respond ONLY with the raw JSON object. Do NOT wrap it in markdown code blocks or backticks. No \`\`\`json, no \`\`\`, just the raw JSON. Escape special characters in the code string properly.`

  return prompt
}

export const CODE_SYSTEM_PROMPT = `You are an expert competitive programmer who has solved thousands of problems on platforms like Codeforces, LeetCode, and HackerRank.

Your task is to write correct, efficient, and clean code solutions.

Key principles:
- Always write complete, runnable code (not pseudocode)
- Include proper main function and input/output handling
- Handle edge cases: empty arrays, single elements, negative numbers, overflow
- Prefer clarity over cleverness when both are equally efficient
- Test your logic against the provided test cases mentally before responding
- For Python: use sys.stdin for faster input in competitive programming
- For Java: use BufferedReader/Scanner with proper exception handling
- For C++: use iostream with ios_base::sync_with_stdio(false)

You must respond in valid JSON format only.`
