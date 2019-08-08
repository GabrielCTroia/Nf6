const exportAnalsysisData = () => {
  console.log('exporting data');

  const rows = analysisModel.map((analysis) => {
    const game = gameModel.read(analysis.gameId);

    if (game) {
      const mySide = getPlayerSide(me, game);
      const opponentSide = getOpponentSide(me, game);

      return flat({
        id: game.id,
        gameTime: game.gameTime,
        gameType: game.gameType,
        gameDateTime: analysis.gameDatetime,
        moves: game.moves,

        myAnalysis: {
          // ...analysis[mySide],
          ...game.players[mySide],
        },
        opponentAnalysis: {
          // ...analysis[opponentSide],
          ...game.players[opponentSide],
        },
      });
    }
  });

  appendToFile('./exports/analysis_16072019.json', rows.map((g) => JSON.stringify(g)).join('\n'));
}