import {
  SectionType,
  Result,
  Data,
  BookmarkData,
  HistoryData,
  TabData,
  ActionData,
} from "@common/types";
import { searchHistory, fetchAllTabs, searchBookmarks } from "../utils";
import { actions } from "./actions";

const DEFAULT_RESULT: Result<Data[]> = { data: [], hasError: false };
const DEFAULT_FUZZINESS = 0.9;
const DEFAULT_SCORE_THRESHOLD = 0.3;

// export async function search(query: string): Promise<Result<SectionType[]>>{
export async function search(query: string): Promise<Result<Data[]>> {
  if (!query) return DEFAULT_RESULT;
  // const result = {hasError: false, data: []};
  try {
    console.log("query: ", query);
    // const history = await searchHistory(query);
    const [history, bookmarks, tabs] = await Promise.all([
      searchHistory(query),
      searchBookmarks(query),
      fetchAllTabs(),
    ]);

    // TODO: do these all need to be in promises
    await Promise.all([
      scoreData(query, tabs, "title", ),
      scoreData(query, actions, "name"),
      scoreData(query, bookmarks, "title"),
      scoreData(query, history, "title"),
    ]);
    console.log(history);
    return { hasError: false, data: history };
  } catch (error) {
    console.log(error);
    return { hasError: true, data: null };
  }
}


function scoreData<T>(query: string, data: T[], key: keyof T) {
  let sumScore = 0;
  const dataLength = data.length;
  const results = [];

  for (let i = 0; i < dataLength; i++) {
    const item = data[i];
    const score = matchScore(query, item[key] as string);
    sumScore += score;
    if (score >= DEFAULT_SCORE_THRESHOLD) {
      results.push(item);
    }
  }

  // take top 20 results
  // sort them
  // get average score
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
