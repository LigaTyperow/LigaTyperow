const personalToken = "06900aadf8064cdab4775b8b1c19db88"
// const url = "https://api.football-data.org/v2/matches"
const url = "https://api.football-data.org/v2/competitions/PL/matches"

export const getData = leagueName => {
    return fetch(`https://api.football-data.org/v2/competitions/${leagueName}/matches`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': personalToken
    }}).then(resp => resp.json());
}
