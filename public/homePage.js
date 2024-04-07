const logout = new LogoutButton();
const ratesBoard = new RatesBoard();
const moneyManager = new MoneyManager();
const favoritesWidget = new FavoritesWidget();

logout.action = function() {
	ApiConnector.logout((response) => {
		if (response.success) {
			location.reload();
		}
	})
}

ApiConnector.current(response => {
	if (response.success) {
		ProfileWidget.showProfile(response.data);
	} else {
		moneyManager.setMessage(response.isSuccess, "Что-то пошло не так. Не удалось получить данные пользователя");
	}
});

const stocks = function() {
	ApiConnector.getStocks(response => {
		if (response.success) {
			ratesBoard.clearTable();
			ratesBoard.fillTable(response.data);
		} else {
			moneyManager.setMessage(response.isSuccess, "Что-то пошло не так. Не удалось получить данные курсов валют");
		}
	})
};
stocks();
setInterval(stocks, 60000);

moneyManager.addMoneyCallback = function({ currency, amount }) {
	ApiConnector.addMoney({ currency, amount }, (response) => {
		if (response.success) {
			ProfileWidget.showProfile(response.data);
			this.setMessage(response.isSuccess, "Деньги зачислены на ваш кошелёк");
		} else {
			this.setMessage(response.isSuccess, "Не удалось зачислить деньги на ваш кошелёк");
		}
	});
};

moneyManager.conversionMoneyCallback = function({ fromCurrency, targetCurrency, fromAmount }) {
	ApiConnector.convertMoney({ fromCurrency, targetCurrency, fromAmount }, (response) => {
		if (response.success) {
			ProfileWidget.showProfile(response.data);
			this.setMessage(response.isSuccess, "Конвертация выполнена");
		} else {
			this.setMessage(response.isSuccess, "Не удалось конвертировать сумму");
		}
	})
}

moneyManager.sendMoneyCallback = function({ to, currency, amount }) {
	ApiConnector.transferMoney({ to, currency, amount }, (response) => {
		if (response.success) {
			ProfileWidget.showProfile(response.data);
			this.setMessage(response.isSuccess, "Перевод выполнен");
		} else {
			this.setMessage(response.isSuccess, "Не удалось выполнить перевод");
		}
	})
}

function update(response) {
	favoritesWidget.clearTable();
	favoritesWidget.fillTable(response.data);
	moneyManager.updateUsersList(response.data);
}

ApiConnector.getFavorites(response => {
	if (response.success) {
		update(response);
	}else {
		favoritesWidget.setMessage(response.isSuccess, "Что-то пошло не так. Не удалось получить данные списка избранных");
	}
});
favoritesWidget.addUserCallback = function({ id, name }) {
	debugger;
	ApiConnector.addUserToFavorites({ id, name }, (response) => {
		if (response.success) {
			update(response);
			this.setMessage(response.isSuccess, "Пользователь добавлен в список избранных");
		} else {
			this.setMessage(response.isSuccess, "Произошла ошибка. Проверьте правильность ввода данных");
		}
	})
};
favoritesWidget.removeUserCallback = function(id) {
	ApiConnector.removeUserFromFavorites(id, (response) => {
		if (response.success) {
			update(response);
			this.setMessage(response.isSuccess, "Пользователь удалён из списка избранных");
		} else {
			this.setMessage(response.isSuccess, "Произошла ошибка. Не удалось удалить пользователя");
		}
	});
}