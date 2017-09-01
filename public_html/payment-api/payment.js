function onBuyClicked(event) {
    if (!window.PaymentRequest) {
      return;
    }
    // Payment Request API is available.
    // Stop the default anchor redirect.
    event.preventDefault();
  
    var supportedInstruments = [{
      supportedMethods: [
        'visa', 'mastercard', 'amex', 'discover', 'maestro',
        'diners', 'jcb', 'unionpay', 'bitcoin'
      ]
    }];
  
    var details = {
      displayItems: [{
        label: 'Original donation amount',
        amount: { currency: 'USD', value: '65.00' }
      }, {
        label: 'Friends and family discount',
        amount: { currency: 'USD', value: '-10.00' }
      }],
      total: {
        label: 'Total due',
        amount: { currency: 'USD', value : '55.00' }
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
        var shippingOption = {
          id: '',
          label: '',
          amount: { currency: 'USD', value: '0.00' },
          selected: true
        };
        // Shipping to US is supported
        if (addr.country === 'US') {
          shippingOption.id = 'us';
          shippingOption.label = 'Standard shipping in US';
          shippingOption.amount.value = '0.00';
          details.total.amount.value = '55.00';
        // Shipping to JP is supported
        } else if (addr.country === 'JP') {
          shippingOption.id = 'jp';
          shippingOption.label = 'International shipping';
          shippingOption.amount.value = '10.00';
          details.total.amount.value = '65.00';
        // Shipping to elsewhere is unsupported
        } else {
          // Empty array indicates rejection of the address
          details.shippingOptions = [];
          return Promise.resolve(details);
        }
        // Hardcode for simplicity
        if (details.displayItems.length === 2) {
          details.displayItems[2] = shippingOption;
        } else {
          details.displayItems.push(shippingOption);
        }
        details.shippingOptions = [shippingOption];
  
        return Promise.resolve(details);
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
    }).catch(function(err) {
      console.error('Uh oh, something bad happened: ' + err.message);
    });
  }
  
  // Assuming an anchor is the target for the event listener.
  document.querySelector('button').addEventListener('click', onBuyClicked);