/**
 * Validates player winning claims against the host's called numbers and the player's marked numbers.
 * Returns { isValid: boolean, error?: string }
 */
const ticketValidator = {
  validate: (ticket, calledNumbers, clientMarkedNumbers, pattern) => {
    if (!ticket || !Array.isArray(ticket) || ticket.length !== 3) {
      return { isValid: false, error: 'Invalid ticket layout format.' };
    }

    const calledSet = new Set(calledNumbers.map(Number));
    const markedSet = new Set(clientMarkedNumbers.map(Number));
    
    // Extract ticket numbers
    const allTicketNumbers = [];
    const rows = [[], [], []];

    for (let r = 0; r < 3; r++) {
      if (!Array.isArray(ticket[r]) || ticket[r].length !== 9) {
        return { isValid: false, error: 'Invalid ticket row length.' };
      }
      for (let c = 0; c < 9; c++) {
        const val = ticket[r][c];
        if (val !== null && val !== undefined) {
          allTicketNumbers.push(Number(val));
          rows[r].push(Number(val));
        }
      }
    }

    // Double check ticket compliance
    if (allTicketNumbers.length !== 15) {
      return { isValid: false, error: 'Ticket must contain exactly 15 numbers.' };
    }

    // Validate based on pattern
    if (pattern === 'earlyFive') {
      // Find numbers on the ticket that have been called by the host
      const calledOnTicket = allTicketNumbers.filter(num => calledSet.has(num));
      if (calledOnTicket.length < 5) {
        return {
          isValid: false,
          error: `Host has only called ${calledOnTicket.length} number(s) present on your ticket. You need at least 5 called numbers to claim.`
        };
      }

      // Check which of those called ticket numbers have been marked by the player
      const markedAndCalled = calledOnTicket.filter(num => markedSet.has(num));
      if (markedAndCalled.length < 5) {
        const unmarked = calledOnTicket.filter(num => !markedSet.has(num));
        return {
          isValid: false,
          error: `You have only marked ${markedAndCalled.length} called numbers. Please mark/dab these called numbers: ${unmarked.join(', ')}`
        };
      }

      return { isValid: true };
    }

    // Identify required numbers for line and corner patterns
    let reqNums = [];
    let patternLabel = '';

    switch (pattern) {
      case 'fourCorners':
        reqNums = [
          rows[0][0], // top-left
          rows[0][4], // top-right
          rows[2][0], // bottom-left
          rows[2][4]  // bottom-right
        ];
        patternLabel = 'Four Corners';
        break;

      case 'topRow':
        reqNums = rows[0];
        patternLabel = 'Top Line';
        break;

      case 'middleRow':
        reqNums = rows[1];
        patternLabel = 'Middle Line';
        break;

      case 'bottomRow':
        reqNums = rows[2];
        patternLabel = 'Bottom Line';
        break;

      case 'fullHouse':
        reqNums = allTicketNumbers;
        patternLabel = 'Full House';
        break;

      default:
        return { isValid: false, error: 'Unknown winning pattern claimed.' };
    }

    // 1. Verify that all required numbers have been called by the host (prevents client-side hacking)
    const uncalled = reqNums.filter(num => !calledSet.has(num));
    if (uncalled.length > 0) {
      return {
        isValid: false,
        error: `Claim rejected. The following number(s) on your ${patternLabel} have not been called yet: ${uncalled.join(', ')}`
      };
    }

    // 2. Verify that the player has actually marked these numbers on their ticket (requires manual/auto dabbing)
    const unmarked = reqNums.filter(num => !markedSet.has(num));
    if (unmarked.length > 0) {
      return {
        isValid: false,
        error: `Claim rejected. You forgot to mark/dab the following number(s) on your ${patternLabel}: ${unmarked.join(', ')}`
      };
    }

    return { isValid: true };
  }
};

module.exports = ticketValidator;
