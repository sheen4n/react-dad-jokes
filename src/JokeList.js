import React, { useEffect, useState } from 'react';
import http from './services/http';
import './JokeList.css';
import { v4 as uuidv4 } from 'uuid';
import Joke from './Joke';

const JokeList = () => {
  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const INIT_JOKES_NUM = 5;
  const FETCH_JOKES_NUM = 5;

  const getJoke = async () => {
    const {
      data: { joke }
    } = await http.get('/', {
      headers: { Accept: 'application/json' }
    });
    const jokeObj = {
      joke,
      id: uuidv4(),
      votes: 0
    };

    if (new Set([...jokes].map(j => j.joke)).has(jokeObj.joke)) return null;

    return jokeObj;
  };

  useEffect(() => {
    const initializeJokes = async () => {
      setIsLoading(true);
      let jokesArray = [];
      while (jokesArray.length < INIT_JOKES_NUM) {
        const newJoke = await getJoke();
        if (newJoke) jokesArray.push(newJoke);
      }
      setJokes(jokesArray);
      syncJokesToLocalStorage(jokesArray);
      setIsLoading(false);
    };

    const existingJokes = JSON.parse(window.localStorage.getItem('jokes'));

    (existingJokes && existingJokes.length) > 0
      ? setJokes(existingJokes)
      : initializeJokes();

    return () => {};
  }, []);

  const handleVote = delta => id => () => {
    const newJokesArray = [...jokes].map(joke =>
      joke.id === id ? { ...joke, votes: joke.votes + delta } : joke
    );
    setJokes(newJokesArray);
    syncJokesToLocalStorage(newJokesArray);
  };

  const fetchJokes = async () => {
    setIsLoading(true);
    let jokesArray = [];
    while (jokesArray.length < FETCH_JOKES_NUM) {
      const newJoke = await getJoke();
      if (newJoke) jokesArray.push(newJoke);
    }
    setJokes([...jokes, ...jokesArray]);
    syncJokesToLocalStorage([...jokes, ...jokesArray]);
    setIsLoading(false);
  };

  const syncJokesToLocalStorage = jokesArray => {
    window.localStorage.setItem('jokes', JSON.stringify(jokesArray));
  };

  if (isLoading)
    return (
      <div className='JokeList-spinner'>
        <i className='far fa-8x fa-laugh fa-spin' />
        <h1 className='JokeList-title'>Loading...</h1>
      </div>
    );

  let sortedJokes = jokes.sort((a, b) => b.votes - a.votes);

  return (
    <div className='JokeList'>
      <div className='JokeList-sidebar'>
        <h1 className='JokeList-title'>
          <span>Dad</span> Jokes
        </h1>
        <img
          src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg'
          alt=''
        />
        <button className='JokeList-getmore' onClick={fetchJokes}>
          Fetch Jokes
        </button>
      </div>

      <div className='JokeList-jokes'>
        {sortedJokes.map(joke => (
          <Joke
            key={joke.id}
            {...joke}
            upVote={handleVote(1)(joke.id)}
            downVote={handleVote(-1)(joke.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default JokeList;
