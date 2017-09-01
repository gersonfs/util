function onBuyClicked(event) {

  event.preventDefault();

  var supportedInstruments = [{
    supportedMethods: [
      'visa', 'mastercard', 'amex', 'discover', 'maestro',
      'diners', 'jcb', 'unionpay', 'bitcoin'
    ]
  }];

  var details = {
    displayItems: [{
      label: 'Calça jeans',
      amount: { currency: 'BRL', value: 70.50 }
    }, {
      label: 'Camiseta',
      amount: { currency: 'BRL', value: 30 }
    }, {
      label: 'Cupom Desconto',
      amount: { currency: 'BRL', value: -10 }
    }],
    total: {
      label: 'Total',
      amount: { currency: 'BRL', value: 90.50 }
    }
  };

  var options = {
    requestShipping: true,
    requestPayerEmail: true,
    requestPayerPhone: true,
    requestPayerName: true
  };

  // Initialization
  var request = new PaymentRequest(supportedInstruments, details, options);

  // When user selects a shipping address
  request.addEventListener('shippingaddresschange', e => {
    e.updateWith(((details, addr) => {

      return new Promise((resolve, reject) => {

        var shippingOption = {
          id: '',
          label: '',
          amount: { currency: 'BRL', value: '0.00' },
          selected: true
        };
        // Shipping to US is supported
        if (addr.country === 'BR') {
          shippingOption.id = 'br';
          shippingOption.label = 'PAC';
          shippingOption.amount.value = 10;
          details.total.amount.value = 100.50;
          // Shipping to JP is supported
        }else{
          // Empty array indicates rejection of the address
          details.shippingOptions = [];
          return Promise.resolve(details);
        }
        // Hardcode for simplicity
        if (details.displayItems.length === 4) {
          details.displayItems[3] = shippingOption;
        } else {
          details.displayItems.push(shippingOption);
        }
        details.shippingOptions = [shippingOption];

        setTimeout(function (){
          resolve(details);
        }, 2000);
        
      });

    })(details, request.shippingAddress));
  });

  // When user selects a shipping option
  request.addEventListener('shippingoptionchange', e => {
    e.updateWith(((details) => {
      // There should be only one option. Do nothing.
      return Promise.resolve(details);
    })(details));
  });

  // Show UI then continue with user payment info
  request.show().then(result => {

    console.log(result.toJSON());

    // POST the result to the server
    return fetch('/payment-api/pay', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result.toJSON())
    }).then(res => {
      // Only if successful
      if (res.status === 200) {
        return res.json();
      } else {
        throw 'Failure';
      }
    }).then(response => {
      // You should have received a JSON object
      if (response.success == true) {
        return result.complete('success');
      } else {
        return result.complete('fail');
      }
    }).then(() => {
      console.log('Thank you!',
        result.shippingAddress.toJSON(),
        result.methodName,
        result.details.toJSON());
    }).catch(() => {
      return result.complete('fail');
    });
  }).catch(function (err) {
    console.error('Uh oh, something bad happened: ' + err.message);
  });
}

// Assuming an anchor is the target for the event listener.
document.querySelector('button').addEventListener('click', onBuyClicked);