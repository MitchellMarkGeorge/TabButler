import {
  SectionType,
  Result,
  Data,
  ScoredDataType,
  SearchResponse,
} from "@common/types";
import { searchHistory, fetchAllTabs, searchBookmarks } from "../utils";
import { actions } from "./actions";

const DEFAULT_RESULT: Result<SearchResponse> = { data: null, hasError: false };
const DEFAULT_FUZZINESS = 0.9;
const DEFAULT_SCORE_THRESHOLD = 0.3;

export async function search(query: string): Promise<Result<SearchResponse>> {
  // export async function search(query: string): Promise<Result<Data[]>> {
  if (!query) return DEFAULT_RESULT;
  try {
    console.log("query: ", query);
    const [history, bookmarks, tabs] = await Promise.all([
      searchHistory(query),
      searchBookmarks(query),
      fetchAllTabs(),
    ]);

    console.log("history", history);
    console.log("bookmarks", bookmarks);

    // TODO: do these all need to be in promises
    const [tabResults, actionResults, bookmarkResults, historyResults] =
      await Promise.all([
        scoreData(query, tabs, ["title", "url"]),
        scoreData(query, actions, "name"),
        scoreData(query, bookmarks, ["title", "url"]),
        scoreData(query, history, ["title", "url"]),
      ]);
    console.log("tabs", tabResults);

    const tabSection: SectionType = {
      items: tabResults.results,
      name: "Tabs",
      score: tabResults.score,
    };

    const actionSection: SectionType = {
      items: actionResults.results,
      name: "Actions",
      score: actionResults.score,
    };

    const bookmarkSection: SectionType = {
      items: bookmarkResults.results,
      name: "Bookmarks",
      score: bookmarkResults.score,
    };
    const historySection: SectionType = {
      items: historyResults.results,
      name: "History",
      score: historyResults.score,
    };

    const sections = [
      tabSection,
      actionSection,
      bookmarkSection,
      historySection,
    ]
      .sort((a, b) => b.score - a.score)
      .filter((section) => section.score > 0);

    const sortedResult = sections.reduce(
      (arr: ScoredDataType[], currentSection) => {
        return arr.concat(currentSection.items);
      },
      [],
    );

    return {
      hasError: false,
      data: {
        sections,
        sortedResult,
      },
    };
  } catch (error) {
    console.log(error);
    return { hasError: true, data: null };
  }
}

function scoreData<T extends Data>(
  query: string,
  data: T[],
  keys: keyof T | Array<keyof T>,
) {
  const dataLength = data.length;
  let results: ScoredDataType[] = [];

  if (!Array.isArray(keys)) {
    for (let i = 0; i < dataLength; i++) {
      const item = data[i];
      const score = matchScore(query, item[keys] as string);
      if (score < DEFAULT_SCORE_THRESHOLD) continue;
      results.push({ score, data: item });
    }
  } else {
    for (let i = 0; i < dataLength; i++) {
      const item = data[i];
      const keyLength = keys.length;
      let maxScore = 0;
      for (let j = 0; j < keyLength; j++) {
        const key = keys[j];
        const score = matchScore(query, item[key] as string);
        if (score < DEFAULT_SCORE_THRESHOLD) continue;
        if (score > maxScore) {
          maxScore = score;
        }
      }
      if (maxScore === 0 || maxScore < DEFAULT_SCORE_THRESHOLD) continue;
      results.push({ score: maxScore, data: item });
    }
  }

  if (results.length === 0) {
    // return null;
    return { score: 0, results: [] };
  }

  results = results.sort((a, b) => b.score - a.score).slice(0, 20);
  const sumScore = results.reduce((prev, a) => a.score + prev, 0);

  return {
    score: sumScore / results.length,
    results,
  };

  // take top 20 results
  // sort them
  // get average score
  // is it the average score of all top 20 results or is if the average score of everything
}

function matchScore(
  query: string,
  target: string,
  fuzziness = DEFAULT_FUZZINESS,
) {
  // TODO: think about the whole fuzziness factor thing
  // if neither of the works exist return 0;
  if (!target || !query) return 0;
  // if both the query and the target are equal just return a perfect score
  if (target === query) return 1;

  let runningScore = 0;
  const targetLen = target.length;
  const queryLen = query.length;

  // lowercase both the target and the query
  const targetLower = target.toLowerCase();
  const queryLower = query.toLowerCase();

  // starting position
  let startAtPosition = 0;
  let fuzzies = 1;

  // Calculate fuzzy factor
  const fuzzyFactor = fuzziness ? 1 - fuzziness : 0;
  // const fuzzyFactor = 0;

  // Walk through query and add up scores.
  // Code duplication occurs to prevent checking fuzziness inside for loop
  for (let i = 0; i < queryLen; i++) {
    // Find next first case-insensitive match of a character.
    const indexOfQueryCharacter = targetLower.indexOf(
      queryLower[i],
      startAtPosition,
    );

    if (indexOfQueryCharacter === -1) {
      if (fuzzyFactor) {
        fuzzies += fuzzyFactor;
      } else {
        return 0;
      }
    } else {
      let currentCharScore = 0;
      if (startAtPosition === indexOfQueryCharacter) {
        // Consecutive letter & start-of-string Bonus
        currentCharScore = 0.7;
      } else {
        currentCharScore = 0.1;

        // Acronym Bonus
        // Weighing Logic: Typing the first character of an acronym is as if you
        // preceded it with two perfect character matches.
        if (target[indexOfQueryCharacter - 1] === " ") {
          currentCharScore += 0.8;
        }
      }

      // Same case bonus.
      if (target[indexOfQueryCharacter] === query[i]) {
        currentCharScore += 0.1;
      }

      // Update scores and startAt position for next round of indexOf
      runningScore += currentCharScore;
      startAtPosition = indexOfQueryCharacter + 1;
    }
  }

  // Reduce penalty for longer strings.
  let finalScore =
    (0.5 * (runningScore / targetLen + runningScore / queryLen)) / fuzzies;

  if (queryLower[0] === targetLower[0] && finalScore < 0.85) {
    finalScore += 0.15;
  }

  return finalScore;
}
