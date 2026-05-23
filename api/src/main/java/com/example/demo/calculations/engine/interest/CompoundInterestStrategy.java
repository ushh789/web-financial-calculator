package com.example.demo.calculations.engine.interest;

import com.example.demo.common.Money;
import com.example.demo.model.InterestMethod;
import com.example.demo.model.RateType;

import org.springframework.stereotype.Component;

@Component
public class CompoundInterestStrategy extends SimpleInterestStrategy {

    @Override
    public boolean supports(RateType type, InterestMethod method) {
        return type == RateType.FIXED && method == InterestMethod.COMPOUND;
    }

    @Override
    public Money updateBalance(Money balance, Money interest) {
        return balance.add(interest);
    }
}
