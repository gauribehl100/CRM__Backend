const evaluateCustomerRules = (customer, rules) => {
  if (!rules || rules.length === 0) return false;

  let result = true;
  let currentLogic = 'AND';

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    
    // Map frontend field names to backend field names
    const fieldMapping = {
      'spend': 'totalSpend',
      'visits': 'visitCount',
      'lastActive': 'daysSinceLastActive'
    };
    
    const field = fieldMapping[rule.field] || rule.field;
    let customerValue;

    if (field === 'daysSinceLastActive') {
      // Calculate days since last active
      const now = new Date();
      const lastVisit = customer.lastVisit || customer.lastActive;
      const diffTime = Math.abs(now - new Date(lastVisit));
      customerValue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      customerValue = customer[field];
    }

    const ruleValue = parseFloat(rule.value);

    let ruleResult = false;
    switch (rule.operator) {
      case 'greater_than':
        ruleResult = customerValue > ruleValue;
        break;
      case 'less_than':
        ruleResult = customerValue < ruleValue;
        break;
      case 'equal_to':
        ruleResult = customerValue === ruleValue;
        break;
      case 'greater_equal':
        ruleResult = customerValue >= ruleValue;
        break;
      case 'less_equal':
        ruleResult = customerValue <= ruleValue;
        break;
    }

    if (i === 0) {
      result = ruleResult;
    } else {
      if (currentLogic === 'AND') {
        result = result && ruleResult;
      } else {
        result = result || ruleResult;
      }
    }

    currentLogic = rule.logic;
  }

  return result;
};

module.exports = {
  evaluateCustomerRules
};
