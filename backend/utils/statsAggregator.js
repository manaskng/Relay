import axios from "axios";

/**
 * Fetches user data from GitHub API
 */
export async function fetchGitHubStats(username) {
  if (!username) return null;
  try {
    const { data } = await axios.get(`https://api.github.com/users/${username}`);
    return {
      followers: data.followers || 0,
      publicRepos: data.public_repos || 0,
    };
  } catch (error) {
    console.error(`GitHub fetch error for ${username}:`, error.message);
    return null;
  }
}

/**
 * Fetches user data from Codeforces API
 */
export async function fetchCodeforcesStats(handle) {
  if (!handle) return null;
  try {
    const { data } = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
    if (data.status === "OK" && data.result.length > 0) {
      const user = data.result[0];
      return {
        rating: user.rating || 0,
        maxRating: user.maxRating || 0,
        rank: user.rank || "Unrated",
      };
    }
    return null;
  } catch (error) {
    console.error(`Codeforces fetch error for ${handle}:`, error.message);
    return null;
  }
}

/**
 * Fetches user data from LeetCode GraphQL API
 */
export async function fetchLeetCodeStats(username) {
  if (!username) return null;
  try {
    const query = `
      query userProblemsSolved($username: String!) {
        allQuestionsCount {
          difficulty
          count
        }
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;
    const { data } = await axios.post("https://leetcode.com/graphql", {
      query,
      variables: { username }
    }, {
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (data.data?.matchedUser?.submitStats?.acSubmissionNum) {
      const submissions = data.data.matchedUser.submitStats.acSubmissionNum;
      
      let stats = { easy: 0, medium: 0, hard: 0, totalSolved: 0 };
      
      submissions.forEach(sub => {
        if (sub.difficulty === "All") stats.totalSolved = sub.count;
        if (sub.difficulty === "Easy") stats.easy = sub.count;
        if (sub.difficulty === "Medium") stats.medium = sub.count;
        if (sub.difficulty === "Hard") stats.hard = sub.count;
      });

      return stats;
    }
    return null;
  } catch (error) {
    console.error(`LeetCode fetch error for ${username}:`, error.message);
    // Fallback to Alfa Leetcode API if official graphql blocks us
    try {
        const { data } = await axios.get(`https://alfa-leetcode-api.onrender.com/${username}/solved`);
        return {
            easy: data.easySolved || 0,
            medium: data.mediumSolved || 0,
            hard: data.hardSolved || 0,
            totalSolved: data.solvedProblem || 0
        };
    } catch(fallbackError) {
        return null;
    }
  }
}
