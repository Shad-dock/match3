// Данные уровней
export const LEVELS = [
    {
        id: 1,
        name: 'Уровень 1',
        type: 'moves', // 'moves' или 'time'
        goal: 100,
        maxMoves: 10,
        timeLimit: 0,
        message: 'Набери 100 очков за 10 ходов!'
    },
    {
        id: 2,
        name: 'Уровень 2',
        type: 'time',
        goal: 200,
        maxMoves: 0,
        timeLimit: 30,
        message: 'Набери 200 очков за 30 секунд!'
    },
    {
        id: 3,
        name: 'Уровень 3',
        type: 'moves',
        goal: 300,
        maxMoves: 15,
        timeLimit: 0,
        message: 'Набери 300 очков за 15 ходов!'
    },
    {
        id: 4,
        name: 'Уровень 4',
        type: 'time',
        goal: 400,
        maxMoves: 0,
        timeLimit: 25,
        message: 'Набери 400 очков за 25 секунд!'
    },
    {
        id: 5,
        name: 'Уровень 5',
        type: 'moves',
        goal: 500,
        maxMoves: 20,
        timeLimit: 0,
        message: 'Набери 500 очков за 20 ходов!'
    }
];