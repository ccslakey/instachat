ServiceConfiguration.configurations.remove({
    service: "instagram"
});
ServiceConfiguration.configurations.insert({
    service: "instagram",
    clientId: "90f3cb97b92b4ee0b847996ec7aa9264",
    scope: 'basic',
    secret: "72bcdbd6fab943e4a60b4e49e12b7983"
});


Accounts.config({
    sendVerificationEmail: true
});
